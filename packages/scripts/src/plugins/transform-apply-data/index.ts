import type { Plugin } from '@/core/plugin';
import type { Post, Column, Label, Metadata } from '@yliu/types/blog';
import { log, warn } from '@/utils/logger';
import type { AIEnhancements } from '@/core/types'; // 从核心类型文件导入
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

      // --- 关键修正点在这里 ---
      // 使用可选链和空值合并，为可能不存在的属性提供安全的默认值
      const { repoDetails = null, issues = [] } =
        context.dataSource.github ?? {};

      if (!posts) {
        warn('没有文章数据，跳过应用数据步骤。');
        return;
      }

      // 因为 issues 可能为空数组，所以后续调用 processLabels(finalPosts, issues) 是安全的
      if (issues.length === 0) {
        warn('没有找到 issues 数据，标签信息可能不完整。');
      }

      const postsWithSeo = applyPostSEO(posts, aiEnhancements?.postsSeo);
      const { finalPosts, finalColumns } = processColumns(
        postsWithSeo,
        aiEnhancements?.columns,
      );
      const finalLabels = processLabels(finalPosts, issues);
      const aboutContent = await readAboutFile();
      const finalMetadata = generateMetadata(
        finalPosts.length,
        finalLabels.length,
        finalColumns.length,
        aiEnhancements?.siteMeta,
        repoDetails,
      );

      context.data.posts = finalPosts;
      context.data.columns = finalColumns;
      context.data.labels = finalLabels;
      context.data.metadata = finalMetadata;
      context.data.about = aboutContent;

      log('✅ 数据整合完成。');
    },
  };
}

function applyPostSEO(
  posts: Post[],
  postsSeo?: AIEnhancements['postsSeo'],
): Post[] {
  if (!postsSeo || postsSeo.length === 0) {
    log('兜底：未应用 AI SEO 数据。');
    return posts;
  }
  log(`应用 ${postsSeo.length} 条 AI SEO 结果到文章...`);
  const seoMap = new Map(postsSeo.map((s) => [s.id, s]));
  return posts.map((post) => {
    const seo = seoMap.get(post.id);
    if (seo) {
      return {
        ...post,
        excerpt: seo.description,
        keywords: seo.keywords,
        labels: [...new Set([...post.labels, ...seo.tags])],
      };
    }
    return post;
  });
}

function processColumns(posts: Post[], columns?: AIEnhancements['columns']) {
  let finalColumns: Column[];
  if (columns && columns.length > 0) {
    log('使用 AI 生成的专栏数据...');
    const postMap = new Map(posts.map((p) => [p.id, p]));
    finalColumns = columns.map((col) => ({
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
  } else {
    log('兜底：使用本地算法处理专栏...');
    const localProcessor = new LocalColumnProcessor();
    finalColumns = localProcessor.process(posts);
  }
  const articleToColumnMap = new Map<number, string>();
  finalColumns.forEach((c) =>
    c.posts.forEach((pid) => articleToColumnMap.set(pid, c.name)),
  );
  const finalPosts = posts.map((p) => ({
    ...p,
    column: articleToColumnMap.get(p.id) || null,
  }));
  log(`处理完成，共生成 ${finalColumns.length} 个专栏。`);
  return { finalPosts, finalColumns };
}

function processLabels(posts: Post[], issues: GithubIssue[]): Label[] {
  const allLabelNames = new Set<string>(posts.flatMap((p) => p.labels));
  const issueLabelMap = new Map(
    issues.flatMap((i) => i.labels).map((l) => [l.name, l]),
  );
  return Array.from(allLabelNames).map((name) => ({
    name: name,
    color: issueLabelMap.get(name)?.color || '000000',
    description: issueLabelMap.get(name)?.description || null,
    count: posts.filter((p) => p.labels.includes(name)).length,
  }));
}

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

function generateMetadata(
  postCount: number,
  labelCount: number,
  columnCount: number,
  siteMeta?: AIEnhancements['siteMeta'],
  repo?: Repo | null,
): Metadata {
  const [owner] = env.NEXT_PUBLIC_GITHUB_REPOSITORY.split('/');
  const siteUrl = env.NEXT_PUBLIC_SITE_URL || `https://${owner}.github.io`;
  if (siteMeta) {
    log('使用 AI 生成的站点元数据...');
    return {
      totalPosts: postCount,
      totalLabels: labelCount,
      totalColumns: columnCount,
      lastUpdate: new Date().toISOString(),
      repository: env.NEXT_PUBLIC_GITHUB_REPOSITORY,
      avatarUrl: repo?.owner.avatar_url || '',
      title: siteMeta.title || repo?.name || '个人博客',
      description:
        siteMeta.description || repo?.description || '一个由内容驱动的博客',
      keywords: siteMeta.keywords || ['blog', 'tech', 'code'],
      url: siteUrl,
    };
  } else {
    log('兜底：使用默认值生成站点元数据...');
    return {
      totalPosts: postCount,
      totalLabels: labelCount,
      totalColumns: columnCount,
      lastUpdate: new Date().toISOString(),
      repository: env.NEXT_PUBLIC_GITHUB_REPOSITORY,
      avatarUrl: repo?.owner.avatar_url || '',
      title: env.NEXT_PUBLIC_BLOG_TITLE || repo?.name || '个人博客',
      description:
        env.NEXT_PUBLIC_SEO_DESCRIPTION ||
        repo?.description ||
        '一个由内容驱动的博客',
      keywords: env.NEXT_PUBLIC_SEO_KEYWORDS?.split(',') || [
        'blog',
        'tech',
        'code',
      ],
      url: siteUrl,
    };
  }
}
