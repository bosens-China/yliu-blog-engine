import { Octokit } from "@octokit/rest";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import readingTime from "reading-time";
import type { BlogData, Post, Label, Column } from "@/types";

// 加载环境变量
dotenv.config();

// --- Type Guards ---
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isGithubLabel(
  obj: unknown
): obj is { name: string; color: string; description: string | null } {
  if (!isObject(obj)) return false;
  return typeof obj.name === "string" && typeof obj.color === "string";
}

function isGithubIssue(obj: unknown): obj is {
  number: number;
  title: string;
  body: string | null;
  user: { login: string; avatar_url: string } | null;
  created_at: string;
  updated_at: string;
  labels: unknown[];
  reactions: Record<string, unknown>;
  comments: number;
  html_url: string;
  pull_request?: unknown;
  state: string;
} {
  if (!isObject(obj)) return false;
  return (
    typeof obj.number === "number" &&
    typeof obj.title === "string" &&
    typeof obj.state === "string" &&
    isObject(obj.user) &&
    typeof obj.user.login === "string"
  );
}

class BlogDataFetcher {
  private octokit: Octokit;
  private repository: string;
  private outputPath: string;

  constructor() {
    const token = process.env.GITHUB_TOKEN;
    const repository = process.env.NEXT_PUBLIC_GITHUB_REPOSITORY;

    if (!repository) {
      throw new Error("NEXT_PUBLIC_GITHUB_REPOSITORY 环境变量未设置");
    }

    this.octokit = new Octokit({ auth: token });
    this.repository = repository;
    this.outputPath = path.join(process.cwd(), "src/data/blog-data.json");
  }

  /**
   * 拉取所有数据并生成JSON文件
   */
  async fetchAllData(): Promise<BlogData> {
    console.log("📡 开始拉取博客数据...");
    console.log(`📦 目标仓库: ${this.repository}`);

    try {
      const [owner, repo] = this.repository.split("/");
      // 并行拉取各种数据
      const [repoInfo, issues, labels, aboutContent] = await Promise.all([
        this.octokit.repos.get({ owner, repo }),
        this.fetchIssues(),
        this.fetchLabels(),
        this.fetchAboutContent(),
      ]);

      console.log(`✅ 成功拉取 ${issues.length} 个Issues`);
      console.log(`✅ 成功拉取 ${labels.length} 个Labels`);

      // 处理Issues为文章
      const posts = this.processIssues(issues);
      console.log(`📝 处理后得到 ${posts.length} 篇有效文章`);

      // 生成专栏信息
      const columns = this.generateColumns(posts);
      console.log(`📚 生成 ${columns.length} 个专栏`);

      // 统计标签使用情况
      const processedLabels = this.processLabels(labels, posts);

      // 构建最终数据
      const blogData: BlogData = {
        posts,
        labels: processedLabels,
        about: aboutContent,
        columns,
        metadata: {
          totalPosts: posts.length,
          totalColumns: columns.length,
          totalLabels: processedLabels.length,
          lastUpdate: new Date().toISOString(),
          repository: this.repository,
          avatarUrl: repoInfo.data.owner.avatar_url,
        },
      };

      // 保存数据
      await this.saveBlogData(blogData);
      console.log(`💾 数据已保存到 ${this.outputPath}`);

      // 输出统计信息
      this.printStatistics(blogData);

      return blogData;
    } catch (error) {
      console.error("❌ 拉取数据失败:", error);
      throw error;
    }
  }

  /**
   * 拉取仓库的所有开放Issues
   */
  private async fetchIssues(): Promise<unknown[]> {
    const [owner, repo] = this.repository.split("/");
    const issues: unknown[] = [];
    let page = 1;

    while (true) {
      console.log(`🔄 拉取Issues第${page}页...`);

      const response = await this.octokit.issues.listForRepo({
        owner,
        repo,
        state: "open",
        per_page: 100,
        page,
        sort: "created",
        direction: "desc",
      });

      if (response.data.length === 0) break;

      issues.push(...response.data);
      page++;

      // 添加延时避免API限制
      if (page > 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return issues;
  }

  /**
   * 拉取仓库的所有Labels
   */
  private async fetchLabels(): Promise<unknown[]> {
    const [owner, repo] = this.repository.split("/");
    const labels: unknown[] = [];
    let page = 1;

    while (true) {
      const response = await this.octokit.issues.listLabelsForRepo({
        owner,
        repo,
        per_page: 100,
        page,
      });

      if (response.data.length === 0) break;

      labels.push(...response.data);
      page++;
    }

    return labels;
  }

  /**
   * 拉取about.md文件内容
   */
  private async fetchAboutContent(): Promise<string | null> {
    const aboutFilePath = path.join(process.cwd(), "about.md");
    if (fs.existsSync(aboutFilePath)) {
      return fs.readFileSync(aboutFilePath, "utf8");
    }
    return null;
  }

  /**
   * 处理Issues，转换为文章格式
   */
  private processIssues(issues: unknown[]): Post[] {
    const validIssues = issues.filter(isGithubIssue);
    return validIssues
      .filter((issue) => !issue.pull_request && issue.state === "open")
      .map((issue) => this.transformIssueToPost(issue))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  /**
   * 检查标题是否符合专栏模式并提取专栏名称
   */
  private extractColumnName(title: string): string | null {
    const patterns = [
      { regex: /^(.+?)之(.+)$/, group: 1 }, // "深入JavaScript之this"
      { regex: /^(.+?)（[一二三四五六七八九十\d]+）(.*)$/, group: 1 }, // "React源码解析（一）"
      { regex: /^(.+?) - (.+)$/, group: 1 }, // "Vue学习笔记 - 响应式"
      { regex: /^(.+?)：(.+)$/, group: 1 }, // "算法系列：排序算法"
      { regex: /^\[(.+?)\](.+)$/, group: 1 }, // "[Node.js]异步编程详解"
      { regex: /^(.+?)\s*\d+[\.\s](.+)$/, group: 1 }, // "JavaScript基础 1. 变量"
    ];

    for (const pattern of patterns) {
      const match = title.match(pattern.regex);
      if (match?.[pattern.group] && match[pattern.group].trim().length > 1) {
        return match[pattern.group].trim();
      }
    }

    return null;
  }

  /**
   * 将Issue转换为Post对象
   */
  private transformIssueToPost(
    issue: Parameters<typeof isGithubIssue>[0] & {}
  ): Post {
    if (!isGithubIssue(issue)) {
      throw new Error("Invalid issue object passed to transformIssueToPost");
    }
    const content = issue.body || "";
    const columnName = this.extractColumnName(issue.title);

    // 提取摘要（前200个字符，去除Markdown语法）
    const excerpt = this.extractExcerpt(content);

    // 提取缩略图（最多3张图片）
    const thumbnail = this.extractThumbnail(content);

    // 计算阅读时间
    const readingTimeResult = readingTime(content);

    // 处理反应数据
    const reactions = issue.reactions || {};
    const reactionTotal = Object.keys(reactions)
      .filter((key) => key !== "url" && key !== "total_count")
      .reduce((sum, key) => sum + ((reactions[key] as number) || 0), 0);

    const authorLogin = issue.user?.login || "ghost";
    const authorAvatar =
      issue.user?.avatar_url ||
      "https://avatars.githubusercontent.com/u/10137?v=4";

    return {
      id: issue.number,
      title: issue.title,
      content,
      excerpt,
      thumbnail,
      author: {
        login: authorLogin,
        name: authorLogin,
        avatar_url: authorAvatar,
      },
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
      labels: issue.labels.filter(isGithubLabel).map((label) => label.name),
      column: columnName,
      readingTime: Math.ceil(readingTimeResult.minutes),
      reactions: {
        total: reactionTotal,
        thumbs_up: (reactions["+1"] as number) || 0,
        heart: (reactions.heart as number) || 0,
        hooray: (reactions.hooray as number) || 0,
        laugh: (reactions.laugh as number) || 0,
        confused: (reactions.confused as number) || 0,
        rocket: (reactions.rocket as number) || 0,
        eyes: (reactions.eyes as number) || 0,
      },
      comments: issue.comments || 0,
      originalUrl: issue.html_url,
    };
  }

  /**
   * 提取文章摘要
   */
  private extractExcerpt(content: string, length = 200): string {
    const moreTagIndex = content.indexOf("<!-- more -->");

    // 如果找到 "more" 标签，则使用其之前的内容作为摘要
    if (moreTagIndex !== -1) {
      const explicitExcerpt = content.substring(0, moreTagIndex);
      // 清理摘要中的Markdown语法
      return explicitExcerpt
        .replace(/```[\s\S]*?```/g, "")
        .replace(/!\[.*?\]\(.*?\)/g, "")
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
        .replace(/[\n#*_~`]/g, " ")
        .trim();
    }

    // 如果没有 "more" 标签，则使用原有逻辑
    const plainText = content
      .replace(/```[\s\S]*?```/g, "") // 移除代码块
      .replace(/`([^`]+)`/g, "$1") // 移除行内代码
      .replace(/!\[.*?\]\(.*?\)/g, "") // 移除图片
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // 移除链接，保留文本
      .replace(/[#*_~`]/g, "") // 移除其他Markdown符号
      .replace(/\n+/g, " ") // 换行转空格
      .trim();

    return plainText.length > length
      ? plainText.substring(0, length) + "..."
      : plainText;
  }

  /**
   * 提取缩略图（最多3张图片）
   */
  private extractThumbnail(content: string): string[] {
    const imageRegex = /!\[.*?\]\((.*?)\)/g;
    const matches = Array.from(content.matchAll(imageRegex), (m) => m[1]);
    return matches.slice(0, 3); // 最多返回3张图片
  }

  /**
   * 生成专栏信息
   */
  private generateColumns(posts: Post[]): Column[] {
    const columnMap = new Map<string, Post[]>();

    // 按专栏分组
    posts.forEach((post) => {
      if (post.column) {
        if (!columnMap.has(post.column)) {
          columnMap.set(post.column, []);
        }
        columnMap.get(post.column)!.push(post);
      }
    });

    // 生成专栏数据，只保留文章数>=2的专栏
    return Array.from(columnMap.entries())
      .filter(([, posts]) => posts.length >= 2)
      .map(([name, columnPosts]) => {
        const sortedPosts = [...columnPosts].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        return {
          name,
          description: this.generateColumnDescription(sortedPosts),
          posts: sortedPosts.map((p) => p.id),
          count: sortedPosts.length,
          lastUpdated: Math.max(
            ...sortedPosts.map((p) => new Date(p.updatedAt).getTime())
          ).toString(),
          thumbnail:
            sortedPosts.find((p) => p.thumbnail && p.thumbnail.length > 0)
              ?.thumbnail[0] || undefined,
        };
      })
      .sort((a, b) => b.count - a.count); // 按文章数量排序
  }

  /**
   * 生成专栏描述
   */
  private generateColumnDescription(posts: Post[]): string {
    const totalPosts = posts.length;
    const topics = posts
      .slice(0, 3)
      .map((p) =>
        p.title.replace(/^.+?[之（\-：\[]/, "").replace(/[）\]].*$/, "")
      );

    return `包含 ${totalPosts} 篇文章，涵盖 ${topics.join("、")} 等主题内容。`;
  }

  /**
   * 处理标签，统计使用情况
   */
  private processLabels(labels: unknown[], posts: Post[]): Label[] {
    const labelCountMap = new Map<string, number>();

    // 统计每个标签的使用次数
    posts.forEach((post) => {
      post.labels.forEach((labelName) => {
        labelCountMap.set(labelName, (labelCountMap.get(labelName) || 0) + 1);
      });
    });

    return labels
      .filter(isGithubLabel)
      .map((label) => ({
        name: label.name,
        color: label.color,
        description: label.description || `${label.name} 相关文章`,
        count: labelCountMap.get(label.name) || 0,
      }))
      .filter((label) => label.count > 0) // 只保留有文章的标签
      .sort((a, b) => b.count - a.count); // 按使用次数排序
  }

  /**
   * 保存数据到JSON文件
   */
  private async saveBlogData(data: BlogData): Promise<void> {
    // 确保目录存在
    const dir = path.dirname(this.outputPath);
    await fs.promises.mkdir(dir, { recursive: true });

    // 写入文件
    await fs.promises.writeFile(
      this.outputPath,
      JSON.stringify(data, null, 2),
      "utf-8"
    );
  }

  /**
   * 打印统计信息
   */
  private printStatistics(data: BlogData): void {
    console.log("\n📊 博客数据统计:");
    console.log("================");
    console.log(`📄 文章总数: ${data.metadata.totalPosts}`);
    console.log(`📚 专栏数量: ${data.metadata.totalColumns}`);
    console.log(`🏷️  标签数量: ${data.metadata.totalLabels}`);
    console.log(`📝 关于页面: ${data.about ? "✅ 已配置" : "❌ 未配置"}`);
    console.log(
      `🕒 更新时间: ${new Date(data.metadata.lastUpdate).toLocaleString()}`
    );

    if (data.columns.length > 0) {
      console.log("\n📚 专栏详情:");
      data.columns.forEach((column) => {
        console.log(`  - ${column.name}: ${column.count}篇文章`);
      });
    }

    if (data.labels.length > 0) {
      console.log("\n🏷️  热门标签:");
      data.labels.slice(0, 10).forEach((label) => {
        console.log(`  - ${label.name}: ${label.count}篇文章`);
      });
    }
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    const fetcher = new BlogDataFetcher();
    await fetcher.fetchAllData();
    console.log("\n🎉 数据拉取完成！");
  } catch (error) {
    console.error("\n❌ 拉取失败:", error);
    process.exit(1);
  }
}

// 直接运行时执行主函数
if (require.main === module) {
  main();
}
