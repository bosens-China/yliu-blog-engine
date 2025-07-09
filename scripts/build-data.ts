import "dotenv/config";
import fs from "node:fs";
import path from "node:path";

import {
  AIEnhancerService,
  PostEnhancement,
  Column as AIColumn,
  PostForAI,
} from "@/lib/ai";
import {
  readDifyCache,
  writeBlogData,
  writeDifyCache,
} from "./lib/file-writer";
import { fetchGitHubIssues } from "./lib/github";
import { extractPost, isPost, processPosts } from "./lib/processor";
import type { DifyCache, AIEnhancements, EnhancedPost } from "./lib/types";
import type { Label, Column, Metadata, BlogData, Post } from "@/types";

const GITHUB_REPOSITORY = process.env.NEXT_PUBLIC_GITHUB_REPOSITORY || "";

/**
 * 获取仓库信息，主要是为了拿到 owner 的头像
 */
async function fetchRepoDetails(owner: string, repo: string) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
  if (!response.ok) {
    console.warn("⚠️ 无法获取仓库详情，将无法设置作者头像。");
    return null;
  }
  const data = await response.json();
  return {
    avatarUrl: data.owner.avatar_url,
    description: data.description,
  };
}

/**
 * 生产环境构建脚本
 * - 获取并处理数据
 * - 使用缓存机制增量更新 AI 数据
 * - 只写入最终的 blog-data.json
 */
async function build() {
  try {
    console.log("🚀 开始生产环境数据构建...");

    const aiService = new AIEnhancerService();
    const isAIEnabled =
      aiService.hasSiteWorkflowConfigured() &&
      aiService.hasPostsWorkflowConfigured();

    if (!isAIEnabled) {
      console.log("💡 AI 增强服务未完整配置，将跳过所有 AI 相关步骤。");
    }

    // 1. 从 GitHub 拉取原始 Issues
    const [owner, repo] = GITHUB_REPOSITORY.split("/");
    const issues = await fetchGitHubIssues();
    const repoDetails = await fetchRepoDetails(owner, repo);

    // 分离 about 页面 - 根据 README，从 about.md 文件读取
    const aboutFilePath = path.join(process.cwd(), "about.md");
    let aboutContent: string | null = null;
    if (fs.existsSync(aboutFilePath)) {
      aboutContent = fs.readFileSync(aboutFilePath, "utf-8");
      console.log("ℹ️ 成功读取 about.md 文件。");
    } else {
      console.log("💡 未找到 about.md 文件，'关于'页面内容将为空。");
    }

    const initialPosts = issues.filter(isPost).map(extractPost);
    console.log(`📝 从 issues 中找到 ${initialPosts.length} 篇有效文章。`);

    // --- AI 增强流程 (如果启用) ---
    let aiEnhancements: AIEnhancements | null = null;
    let newCache: DifyCache | null = null;

    if (isAIEnabled) {
      const cachedData = readDifyCache();

      // 识别需要更新的文章
      const postsToEnhance: PostForAI[] = [];
      const upToDateEnhancements: PostEnhancement[] = [];
      for (const post of initialPosts) {
        const cachedPost = cachedData?.enhanced_posts[post.id];
        if (
          !cachedPost ||
          new Date(post.updatedAt) > new Date(cachedPost.updatedAt)
        ) {
          postsToEnhance.push({
            id: post.id,
            title: post.title,
            content: post.content || "",
          });
        } else {
          upToDateEnhancements.push(cachedPost);
        }
      }
      console.log(`🔎 发现 ${postsToEnhance.length} 篇文章需要 AI 增强。`);
      console.log(`✅ ${upToDateEnhancements.length} 篇文章的 AI 数据为最新。`);

      // (批处理) 获取文章增强数据
      let newlyEnhancedPosts: PostEnhancement[] = [];
      if (postsToEnhance.length > 0) {
        const results = await aiService.enhancePosts(postsToEnhance);
        if (results) {
          newlyEnhancedPosts = results;
          console.log(`✨ 成功增强 ${newlyEnhancedPosts.length} 篇文章。`);
        }
      }

      // 获取站点全局增强数据
      let siteEnhancements = cachedData
        ? { site_meta: cachedData.site_meta, columns: cachedData.columns }
        : null;
      const allPostTitles = initialPosts.map((p) => p.title);
      const allPostIds = initialPosts.map((p) => p.id);
      const allLabels = Array.from(
        new Set(initialPosts.flatMap((p) => p.labels))
      );
      const result = await aiService.enhanceSite(
        allPostTitles,
        allLabels,
        allPostIds
      );
      if (result) {
        siteEnhancements = result;
        console.log("✨ 成功获取站点元数据和专栏信息。");
      }

      const allEnhancedPosts = [...upToDateEnhancements, ...newlyEnhancedPosts];
      aiEnhancements = {
        site_meta: siteEnhancements?.site_meta || {
          description: "",
          keywords: [],
        },
        columns: siteEnhancements?.columns || [],
        enhanced_posts: allEnhancedPosts as EnhancedPost[],
      };

      // 准备新缓存
      newCache = {
        site_meta: aiEnhancements.site_meta,
        columns: aiEnhancements.columns,
        enhanced_posts: {},
      };
      const postMap = new Map(initialPosts.map((p) => [p.id, p]));
      for (const enhancedPost of allEnhancedPosts) {
        const originalPost = postMap.get(Number(enhancedPost.id));
        if (originalPost) {
          newCache.enhanced_posts[enhancedPost.id] = {
            ...enhancedPost,
            updatedAt: originalPost.updatedAt,
          };
        }
      }
    }

    // --- 数据最终处理 ---
    const finalPosts = processPosts(initialPosts, aiEnhancements);

    // --- 生成完整的 BlogData ---

    // 1. 处理标签
    const allLabels = issues.flatMap((issue) => issue.labels);
    const uniqueLabelNames = Array.from(new Set(allLabels.map((l) => l.name)));
    const labels: Label[] = uniqueLabelNames.map((name) => {
      const label = allLabels.find((l) => l.name === name)!;
      return {
        name: label.name,
        color: label.color,
        description: label.description || "",
        count: finalPosts.filter((p) => p.labels.includes(name)).length,
      };
    });

    // 2. 处理专栏
    let columns: Column[] = [];
    if (aiEnhancements?.columns && aiEnhancements.columns.length > 0) {
      columns = aiEnhancements.columns.map((c: AIColumn) => {
        const postsInColumn = finalPosts.filter((p) =>
          c.post_ids.includes(p.id)
        );
        const lastUpdated =
          postsInColumn.length > 0
            ? postsInColumn.sort(
                (a, b) =>
                  new Date(b.updatedAt).getTime() -
                  new Date(a.updatedAt).getTime()
              )[0].updatedAt
            : new Date().toISOString();

        return {
          name: c.name,
          description: "", // AI 目前不返回描述，默认为空
          count: c.post_ids.length,
          posts: c.post_ids,
          lastUpdated,
        };
      });
    } else {
      // 如果 AI 未提供专栏信息，则从文章中提取
      const columnMap = new Map<string, number[]>();

      // --- 全新的、基于相似度的专栏识别算法 ---

      // 1. 优先处理带“专栏/”标签的文章
      const postsWithoutColumnLabel: Post[] = [];

      finalPosts.forEach((p) => {
        const columnLabel = p.labels.find(
          (label) => label.startsWith("专栏/") || label.startsWith("column:")
        );
        if (columnLabel) {
          const columnName = columnLabel.replace(/^(专栏\/|column:)/, "");
          if (!columnMap.has(columnName)) {
            columnMap.set(columnName, []);
          }
          columnMap.get(columnName)!.push(p.id);
        } else {
          postsWithoutColumnLabel.push(p);
        }
      });
      console.log(`ℹ️  通过标签识别到 ${columnMap.size} 个专栏。`);

      // 2. 对剩余文章进行基于前缀相似度的分析
      const findLCP = (str1: string, str2: string): string => {
        let i = 0;
        while (i < str1.length && i < str2.length && str1[i] === str2[i]) {
          i++;
        }
        return str1.substring(0, i);
      };

      if (postsWithoutColumnLabel.length > 1) {
        const sortedPosts = [...postsWithoutColumnLabel].sort((a, b) =>
          a.title.localeCompare(b.title)
        );

        let currentGroup: Post[] = [sortedPosts[0]];
        const minPrefixLength = parseInt(
          process.env.COLUMN_MIN_PREFIX_LENGTH || "6",
          10
        );

        for (let i = 0; i < sortedPosts.length - 1; i++) {
          const lcp = findLCP(sortedPosts[i].title, sortedPosts[i + 1].title);
          // 清理LCP，并设置一个合理的最小长度阈值
          const cleanedLcp = lcp
            .trim()
            .replace(/[之\-：:_\s（(]+$/, "")
            .trim();

          if (cleanedLcp.length >= minPrefixLength) {
            currentGroup.push(sortedPosts[i + 1]);
          } else {
            if (currentGroup.length >= 2) {
              const groupLCP = findLCP(
                currentGroup[0].title,
                currentGroup[currentGroup.length - 1].title
              )
                .trim()
                .replace(/[之\-：:_\s（(]+$/, "")
                .trim();

              if (groupLCP.length >= minPrefixLength) {
                const postIds = currentGroup.map((p) => p.id);
                if (!columnMap.has(groupLCP)) columnMap.set(groupLCP, []);
                const existing = columnMap.get(groupLCP)!;
                columnMap.set(groupLCP, [
                  ...new Set([...existing, ...postIds]),
                ]);
              }
            }
            currentGroup = [sortedPosts[i + 1]];
          }
        }
        // 处理最后一组
        if (currentGroup.length >= 2) {
          const groupLCP = findLCP(
            currentGroup[0].title,
            currentGroup[currentGroup.length - 1].title
          )
            .trim()
            .replace(/[之\-：:_\s（(]+$/, "")
            .trim();
          if (groupLCP.length >= minPrefixLength) {
            const postIds = currentGroup.map((p) => p.id);
            if (!columnMap.has(groupLCP)) columnMap.set(groupLCP, []);
            const existing = columnMap.get(groupLCP)!;
            columnMap.set(groupLCP, [...new Set([...existing, ...postIds])]);
          }
        }
      }

      console.log("ℹ️  检测到以下潜在专栏及其文章数:");
      Array.from(columnMap.entries()).forEach(([name, postIds]) => {
        console.log(`   - "${name}": ${postIds.length} 篇`);
      });

      columns = Array.from(columnMap.entries())
        .filter(([, postIds]) => postIds.length >= 2) // 至少需要2篇文章才算一个专栏
        .map(([name, postIds]) => {
          const postsInColumn = finalPosts.filter((p) =>
            postIds.includes(p.id)
          );
          const lastUpdated =
            postsInColumn.length > 0
              ? postsInColumn.sort(
                  (a, b) =>
                    new Date(b.updatedAt).getTime() -
                    new Date(a.updatedAt).getTime()
                )[0].updatedAt
              : new Date().toISOString();
          return {
            name,
            description: "", // 手动提取时无描述
            posts: postIds,
            count: postIds.length,
            lastUpdated,
          };
        });

      console.log(
        `✅ 根据“至少2篇文章”原则，最终生成 ${columns.length} 个专栏。`
      );
    }

    // --- 为文章对象分配最终的专栏名 ---
    const postColumnMap = new Map<number, string>();
    columns.forEach((column) => {
      column.posts.forEach((postId) => {
        postColumnMap.set(postId, column.name);
      });
    });
    finalPosts.forEach((post) => {
      post.column = postColumnMap.get(post.id) || null;
    });

    // 3. 构建元数据
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || `https://${owner}.github.io`;
    const defaultTitle = `${owner}的个人博客`;

    const metadata: Metadata = {
      totalPosts: finalPosts.length,
      totalLabels: labels.length,
      totalColumns: columns.length,
      lastUpdate: new Date().toISOString(),
      repository: GITHUB_REPOSITORY,
      avatarUrl: repoDetails?.avatarUrl || "",
      title: process.env.NEXT_PUBLIC_BLOG_TITLE || defaultTitle,
      url: siteUrl,
      description:
        aiEnhancements?.site_meta?.description ||
        repoDetails?.description ||
        "",
      keywords: aiEnhancements?.site_meta?.keywords || [],
    };

    // 4. 组合最终数据
    const finalData: BlogData = {
      posts: finalPosts,
      labels,
      columns,
      about: aboutContent,
      metadata,
    };

    // --- 文件写入 ---
    writeBlogData(finalData);
    if (newCache) {
      writeDifyCache(newCache);
    }

    console.log("✅ 数据拉取和处理流程执行完毕。");
  } catch (error) {
    console.error("❌ 生产数据构建失败:");
    console.error(error);
    process.exit(1);
  }
}

build();
