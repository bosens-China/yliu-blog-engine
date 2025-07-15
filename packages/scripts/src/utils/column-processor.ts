import type { Post, Column } from '@yliu/types/blog';

/**
 * 本地专栏处理器，根据标签或标题前缀进行分析。
 * 作为 AI 专栏分析的兜底方案。
 */
export class LocalColumnProcessor {
  private minPrefixLength: number;

  constructor(minPrefixLength = 6) {
    this.minPrefixLength = minPrefixLength;
  }

  public process(posts: Post[]): Column[] {
    const columnMap = new Map<string, number[]>();

    posts.forEach((p) => {
      // 优先从标签中寻找专栏定义，例如 "专栏/系列A" 或 "column:系列A"
      const columnLabel = p.labels.find(
        (label) => label.startsWith('专栏/') || label.startsWith('column:'),
      );
      if (columnLabel) {
        const columnName = columnLabel.replace(/^(专栏\/|column:)/, '').trim();
        if (!columnMap.has(columnName)) {
          columnMap.set(columnName, []);
        }
        columnMap.get(columnName)!.push(p.id);
      }
    });

    // 过滤掉不满足条件的（少于2篇）
    const finalColumns = Array.from(columnMap.entries())
      .filter(([, postIds]) => postIds.length >= 2)
      .map(([name, postIds]) => this.createColumnObject(name, postIds, posts));

    return finalColumns;
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
