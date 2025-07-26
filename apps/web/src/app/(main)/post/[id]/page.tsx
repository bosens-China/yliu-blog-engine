import { getPostById, getBlogData } from '@/lib/data';
import { notFound } from 'next/navigation';
import MarkdownContent from '@/components/MarkdownContent';
import TableOfContents from '@/components/TableOfContents';
import { format } from 'date-fns';
import { Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: Props): Promise<Metadata | null> {
  const { id } = await params;
  const post = getPostById(Number(id));

  if (!post) {
    // 如果文章不存在，则回退到全局 metadata
    return null;
  }

  // 如果没有 AI 关键词，则回退到全局 metadata
  if (!post.keywords || post.keywords.length === 0) {
    return null;
  }

  const { metadata: blogMetadata } = getBlogData();
  const repoOwner = blogMetadata.repository.split('/')[0];
  const authorName = blogMetadata.author;

  const description = post.excerpt;
  const keywords = [
    ...(post.keywords || []),
    ...(post.labels.map((f) => f.name) || []),
  ];
  if (post.column) {
    keywords.push(post.column);
  }

  return {
    title: post.title,
    description: description,
    keywords: keywords,
    authors: [{ name: authorName, url: `https://github.com/${repoOwner}` }],
    openGraph: {
      title: post.title,
      description: description,
      type: 'article',
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      images: post.thumbnail.map((url) => ({ url })),
      authors: [`https://github.com/${repoOwner}`],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: description,
      images: post.thumbnail.length > 0 ? [post.thumbnail[0]] : [],
    },
  };
}

// 预构建所有文章页面
export async function generateStaticParams() {
  const { posts } = getBlogData();
  return posts.map((post) => ({
    id: post.id.toString(),
  }));
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const post = getPostById(Number(id));

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
      <div className="flex gap-8 lg:gap-12">
        {/* 主要内容区域 */}
        <article className="flex-1 min-w-0 page-content-bg rounded-lg shadow-sm p-6 md:p-8 border border-border/20">
          {/* 文章头部 */}
          <header className="mb-8 page-title">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground text-sm">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <time dateTime={post.createdAt}>
                  {format(new Date(post.createdAt), 'yyyy年MM月dd日')}
                </time>
                {post.labels.map((label, index) => (
                  <span key={label.id}>
                    <Link
                      key={label.id}
                      href={`/category/${label.id}`}
                      className="bg-secondary/50 text-foreground dark:text-secondary-foreground text-xs px-3 py-1 rounded-full hover:bg-secondary/70 transition-colors"
                    >
                      #{label.name}
                    </Link>
                    {index < post.labels.length - 1 && ', '}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{post.readingTime} 分钟阅读</span>
              </div>
            </div>
          </header>

          {/* 文章内容 */}
          <MarkdownContent content={post.content} />
        </article>

        {/* 桌面端目录 - 只在大屏显示 */}
        <div className="hidden lg:block">
          <TableOfContents content={post.content} variant="sidebar" />
        </div>
      </div>

      {/* 移动端目录 - 浮动在右下角 */}
      <div className="lg:hidden">
        <TableOfContents content={post.content} variant="floating" />
      </div>
    </div>
  );
}
