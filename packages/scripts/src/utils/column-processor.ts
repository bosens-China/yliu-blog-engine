import type { Post, Column } from '@yliu/types/blog';
import { env } from '@/config/env';

/**
 * 本地专栏处理器，根据标题分隔符或公共前缀进行分析。
 * 作为 AI 专栏分析的兜底方案，提供更智能的本地识别能力。
 */
export class LocalColumnProcessor {
  private delimiters: string[];
  private minArticles: number;

  constructor() {
    this.delimiters = env.COLUMN_DELIMITERS.split(',').filter(Boolean);
    this.minArticles = env.COLUMN_MIN_ARTICLES;
  }

  public process(posts: Post[]): Column[] {
    const columnMap = new Map<string, number[]>();

    // 1. 基于分隔符的精确匹配
    posts.forEach((post) => {
      for (const delimiter of this.delimiters) {
        const parts = post.title.split(delimiter);
        if (parts.length > 1) {
          const columnName = parts[0].trim();
          if (columnName) {
            if (!columnMap.has(columnName)) {
              columnMap.set(columnName, []);
            }
            columnMap.get(columnName)!.push(post.id);
            return; // 一旦匹配成功，就不再尝试其他分隔符
          }
        }
      }
    });

    // 2. 对剩余文章进行基于公共前缀的模糊匹配
    const remainingPosts = posts.filter(
      (p) => !Array.from(columnMap.values()).flat().includes(p.id),
    );

    if (remainingPosts.length > 1) {
      // 按标题排序以便于比较相邻项
      const sorted = remainingPosts.sort((a, b) => a.title.localeCompare(b.title));
      for (let i = 0; i < sorted.length - 1; i++) {
        const lcp = this.longestCommonPrefix(sorted[i].title, sorted[i + 1].title);
        if (lcp.length >= env.COLUMN_MIN_PREFIX_LENGTH) {
          const columnName = lcp.trim();
          if (!columnMap.has(columnName)) {
            columnMap.set(columnName, []);
          }
          // 将所有具有此公共前缀的文章归入该专栏
          sorted.forEach((p) => {
            if (p.title.startsWith(lcp) && !columnMap.get(columnName)?.includes(p.id)) {
              columnMap.get(columnName)!.push(p.id);
            }
          });
        }
      }
    }

    // 3. 过滤掉不满足最小文章数的专栏，并创建最终对象
    const finalColumns = Array.from(columnMap.entries())
      .filter(([, postIds]) => postIds.length >= this.minArticles)
      .map(([name, postIds]) => this.createColumnObject(name, postIds, posts));

    return finalColumns;
  }

  private longestCommonPrefix(str1: string, str2: string): string {
    let i = 0;
    while (i < str1.length && i < str2.length && str1[i] === str2[i]) {
      i++;
    }
    return str1.substring(0, i);
  }

  private createColumnObject(
    name: string,
    postIds: number[],
    allPosts: Post[],
  ): Column {
    const postsInColumn = allPosts.filter((p) => postIds.includes(p.id));
    const latestPost = postsInColumn.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )[0];

    return {
      name,
      description: `关于“${name}”的系列文章。`,
      posts: postIds,
      count: postIds.length,
      lastUpdated: latestPost?.updatedAt || new Date().toISOString(),
    };
  }
}