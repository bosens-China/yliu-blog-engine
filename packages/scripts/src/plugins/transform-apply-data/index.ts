import type { Plugin } from '@/core/plugin';
import type { Post, Column, Label, Metadata } from '@yliu/types/blog';
import { log, warn } from '@/utils/logger';
import type { AIEnhancements } from '@/core/types';
import { LocalColumnProcessor } from '@/utils/column-processor';
import fse from 'fs-extra';
import path from 'node:path';
import { env } from '@/config/env';
import type { Repo } from '@yliu/types/repo';
import type { GithubIssue } from '@yliu/types/issues';
import type { BuildContext } from '@/core/types';

export function createApplyDataTransformPlugin(): Plugin {
  return {
    name: 'plugin-transform-apply-data',

    async transform(context: BuildContext) {
      log('整合所有数据，生成最终产物...');
      const { posts, aiEnhancements } = context.data;
      const { repoDetails = null, issues = [] } =
        context.dataSource.github ?? {};

      if (!posts) {
        warn('没有文章数据，跳过应用数据步骤。');
        return;
      }
      if (issues.length === 0) {
        warn('没有找到 issues 数据，标签信息可能不完整。');
      }

      // 1. 应用 AI 生成的文章 SEO 数据
      const postsWithSeo = applyPostSEO(posts, aiEnhancements?.postsSeo);

      // 2. 处理专栏，并将专栏信息应用到文章上
      const { finalPosts, finalColumns } = processColumns(
        postsWithSeo,
        aiEnhancements?.columns,
      );

      // 3. 基于最终的文章列表和 issue 生成标签
      const finalLabels = processLabels(finalPosts, issues);

      // 4. 读取 about.md 文件内容
      const aboutContent = await readAboutFile();

      // 5. 基于所有可用信息生成最终的站点元数据
      const finalMetadata = generateMetadata(
        finalPosts.length,
        finalLabels.length,
        finalColumns.length,
        aiEnhancements?.siteMeta,
        repoDetails,
      );

      // 6. 将所有处理完成的数据更新回上下文
      context.data.posts = finalPosts;
      context.data.columns = finalColumns;
      context.data.labels = finalLabels;
      context.data.metadata = finalMetadata;
      context.data.about = aboutContent;

      log('✅ 数据整合完成。');
    },
  };
}

// =============================================================================
// 辅助函数
// =============================================================================

/**
 * 根据优先级从多个来源中选择第一个有效值。
 * "有效"意味着值不是 null、undefined、空字符串或空数组。
 * @param values 按优先级顺序排列的值数组
 * @returns 第一个有效值，如果都无效则返回 undefined
 */
function getPrioritizedValue<T>(
  values: (T | undefined | null)[],
): T | undefined {
  for (const value of values) {
    if (value == null) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    if (Array.isArray(value) && value.length === 0) continue;
    return value;
  }
  return undefined;
}

/**
 * 将 AI 生成的 SEO 信息（摘要、关键词）应用到文章对象上。
 */
function applyPostSEO(
  posts: Post[],
  postsSeo?: AIEnhancements['postsSeo'],
): Post[] {
  if (!postsSeo || postsSeo.length === 0) {
    log('兜底：未找到 AI 生成的文章 SEO 数据，跳过应用。');
    return posts;
  }

  log(`正在应用 ${postsSeo.length} 条 AI SEO 结果到文章...`);
  const seoMap = new Map(postsSeo.map((s) => [s.id, s]));

  return posts.map((post) => {
    const seo = seoMap.get(post.id);
    if (seo) {
      return {
        ...post,
        excerpt: seo.description, // 使用 AI 生成的摘要
        keywords: seo.keywords, // 使用 AI 生成的关键词
      };
    }
    return post;
  });
}

/**
 * 处理专栏数据。优先使用 AI 生成的结果，否则回退到本地算法。
 * @returns 返回处理后的文章列表（包含专栏信息）和专栏列表。
 */
function processColumns(posts: Post[], aiColumns?: AIEnhancements['columns']) {
  const finalColumns =
    aiColumns && aiColumns.length > 0
      ? processColumnsWithAI(posts, aiColumns)
      : processColumnsLocally(posts);

  const articleToColumnMap = new Map<number, string>();
  finalColumns.forEach((c) =>
    c.posts.forEach((pid) => articleToColumnMap.set(pid, c.name)),
  );

  const finalPosts = posts.map((p) => ({
    ...p,
    column: articleToColumnMap.get(p.id) || null,
  }));

  log(`专栏处理完成，共生成 ${finalColumns.length} 个专栏。`);
  return { finalPosts, finalColumns };
}

function processColumnsWithAI(
  posts: Post[],
  aiColumns: NonNullable<AIEnhancements['columns']>,
): Column[] {
  log('使用 AI 生成的专栏数据...');
  const postMap = new Map(posts.map((p) => [p.id, p]));
  return aiColumns.map((col, index) => ({
    id: index + 1,
    name: col.name,
    description: col.description,
    posts: col.article_ids,
    count: col.article_ids.length,
    lastUpdated:
      col.article_ids
        .map((id) => postMap.get(id)?.updatedAt)
        .filter((d): d is string => !!d)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ||
      new Date().toISOString(),
  }));
}

function processColumnsLocally(posts: Post[]): Column[] {
  log('兜底：使用本地算法分析专栏...');
  const localProcessor = new LocalColumnProcessor();
  return localProcessor.process(posts);
}

/**
 * 基于文章和 issue 数据生成唯一的标签列表。
 */
function processLabels(posts: Post[], issues: GithubIssue[]): Label[] {
  const allLabels = new Set<string>(
    posts.flatMap((p) => p.labels.map((l) => l.name)),
  );
  const issueLabelMap = new Map(
    issues.flatMap((i) => i.labels).map((l) => [l.name, l]),
  );

  return Array.from(allLabels).map((name) => {
    const issueLabel = issueLabelMap.get(name);
    return {
      id: issueLabel?.id || 0,
      name: name,
      color: issueLabel?.color || '000000',
      description: issueLabel?.description || null,
      count: posts.filter((p) => p.labels.some((l) => l.name === name)).length,
    };
  });
}

/**
 * 读取项目根目录下的 about.md 文件。
 */
async function readAboutFile(): Promise<string | null> {
  try {
    const aboutPath = path.join(process.cwd(), 'about.md');
    if (await fse.pathExists(aboutPath)) {
      log('成功读取 about.md 文件。');
      return await fse.readFile(aboutPath, 'utf-8');
    }
  } catch (e: unknown) {
    warn(`读取 about.md 文件失败: ${(e as Error).message}`);
  }
  return null;
}

/**
 * 生成最终的站点元数据，严格遵循 用户配置 > AI > 兜底 的优先级。
 */
function generateMetadata(
  postCount: number,
  labelCount: number,
  columnCount: number,
  siteMeta?: AIEnhancements['siteMeta'],
  repo?: Repo | null,
): Metadata {
  const [owner] = env.NEXT_PUBLIC_GITHUB_REPOSITORY.split('/');

  // 1. 收集所有来源的数据
  const user = {
    title: env.NEXT_PUBLIC_BLOG_TITLE,
    author: env.NEXT_PUBLIC_BLOG_AUTHOR,
    description: env.NEXT_PUBLIC_SEO_DESCRIPTION,
    keywords: env.NEXT_PUBLIC_SEO_KEYWORDS?.split(',').map((k) => k.trim()),
    siteUrl: env.NEXT_PUBLIC_SITE_URL,
    headerConfig: env.NEXT_PUBLIC_HEADER_CONFIG,
  };
  const ai = {
    // AI 不生成标题
    description: siteMeta?.description,
    keywords: siteMeta?.keywords,
  };
  const fallback = {
    title: repo?.name,
    author: owner,
    description: repo?.description,
    siteUrl: `https://${owner}.github.io`,
    keywords: ['blog', 'code'],
  };

  // 2. 应用优先级规则
  const title = getPrioritizedValue([user.title, fallback.title]) || '个人博客';
  const description =
    getPrioritizedValue([
      user.description,
      ai.description,
      fallback.description,
    ]) || '一个由内容驱动的博客';
  const keywords =
    getPrioritizedValue([user.keywords, ai.keywords, fallback.keywords]) || [];
  const author = getPrioritizedValue([user.author, fallback.author]) || '';
  const siteUrl = getPrioritizedValue([user.siteUrl, fallback.siteUrl]) || '';

  log(`元数据已确定: 标题='${title}', 作者='${author}'`);
  if (ai.description || ai.keywords) {
    log('部分元数据由 AI 生成。');
  } else {
    log('元数据来自用户配置或兜底值。');
  }

  // 3. 构建并返回最终对象
  return {
    totalPosts: postCount,
    totalLabels: labelCount,
    totalColumns: columnCount,
    lastUpdate: new Date().toISOString(),
    repository: env.NEXT_PUBLIC_GITHUB_REPOSITORY,
    avatarUrl: repo?.owner.avatar_url || '',
    title,
    description,
    keywords,
    url: siteUrl,
    author,
    headerConfig: user.headerConfig || null,
  };
}
