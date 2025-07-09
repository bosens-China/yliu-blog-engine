import type { Post } from "@/types";
import readingTime from "reading-time";
import type { GithubIssue, AIEnhancements, EnhancedPost } from "./types.js";

/**
 * 检查一个 issue 是否是博客文章
 * @param issue GithubIssue
 * @returns boolean
 */
export const isPost = (issue: GithubIssue): boolean =>
  !issue.title.includes("about");

/**
 * 将 GithubIssue 对象转换为 Post 对象
 * @param issue GithubIssue
 * @returns Post
 */
export const extractPost = (issue: GithubIssue): Post => {
  return {
    id: issue.number,
    title: issue.title,
    content: issue.body || "",
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    author: {
      name: issue.user.login,
      avatar_url: issue.user.avatar_url,
      login: issue.user.login,
    },
    labels: issue.labels.map((label) => label.name),
    reactions: {
      total: issue.reactions.total_count,
      thumbs_up: issue.reactions["+1"],
      heart: issue.reactions.heart,
      hooray: issue.reactions.hooray,
      laugh: issue.reactions.laugh,
      confused: issue.reactions.confused,
      rocket: issue.reactions.rocket,
      eyes: issue.reactions.eyes,
    },
    comments: issue.comments,
    originalUrl: issue.html_url,
    thumbnail: ((issue.body || "").match(/!\[.*?\]\((.*?)\)/g) || [])
      .slice(0, 3)
      .map((md) => md.match(/\((.*?)\)/)?.[1] || "") as string[], // 显式类型断言
    // 下面是等待填充的字段
    excerpt: "",
    column: "", // 专栏信息将在 build-data.ts 中集中处理
    readingTime: 0,
    keywords: [],
  };
};

/**
 * 计算阅读时间
 * @param text string
 * @returns number
 */
export function calculateReadingTime(text: string): number {
  if (!text) {
    return 0;
  }
  const stats = readingTime(text);
  return Math.ceil(stats.minutes);
}

/**
 * 生成摘要
 * @param content string
 * @returns string
 */
export function generateExcerpt(content: string): string {
  const strippedContent = content
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/<.*?>/g, "");
  return strippedContent.slice(0, 200) + "...";
}

/**
 * 将AI数据与原始帖子数据合并
 * @param posts Post[] - 原始帖子列表
 * @param aiEnhancements AIEnhancements | null - AI返回的数据
 * @returns Post[] - 合并后的帖子列表
 */
export function processPosts(
  posts: Post[],
  aiEnhancements: AIEnhancements | null
): Post[] {
  console.log("🔄 正在处理和合并数据...");

  const columnsMap = new Map<number, string>();
  if (aiEnhancements?.columns) {
    for (const column of aiEnhancements.columns) {
      for (const postId of column.post_ids) {
        columnsMap.set(postId, column.name);
      }
    }
  }

  const enhancedPostsMap = new Map<string, EnhancedPost>();
  if (aiEnhancements?.enhanced_posts) {
    for (const enhancedPost of aiEnhancements.enhanced_posts) {
      enhancedPostsMap.set(enhancedPost.id, enhancedPost);
    }
  }

  const processed = posts.map((post) => {
    const enhancedData = enhancedPostsMap.get(String(post.id));

    return {
      ...post,
      excerpt: enhancedData?.summary || generateExcerpt(post.content),
      keywords: enhancedData?.keywords || [],
      readingTime: calculateReadingTime(post.content),
      column: columnsMap.get(post.id) || "",
    };
  });

  console.log("✅ 所有文章处理完毕。");
  return processed;
}
