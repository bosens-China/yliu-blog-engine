import { getPostById, getBlogData } from "@/lib/data";
import { notFound } from "next/navigation";
import MarkdownContent from "@/components/MarkdownContent";
import { format } from "date-fns";
import { Calendar, Clock } from "lucide-react";
import Link from "next/link";

interface PostPageProps {
  params: Promise<{
    id: string;
  }>;
}

// 预构建所有文章页面
export async function generateStaticParams() {
  const { posts } = getBlogData();
  return posts.map((post) => ({
    id: post.id.toString(),
  }));
}

export default async function PostPage({ params }: PostPageProps) {
  // 先await params对象
  const { id } = await params;
  const post = getPostById(Number(id));

  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto pt-6">
      <article className="max-w-5xl mx-auto bg-white dark:bg-card rounded-lg shadow-sm p-6 md:p-8 border border-border/20">
        {/* 文章头部 */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <time dateTime={post.createdAt}>
                {format(new Date(post.createdAt), "yyyy年MM月dd日")}
              </time>
              {post.labels.map((label, index) => (
                <span key={label}>
                  <Link
                    href={`/category/${encodeURIComponent(label)}`}
                    className="bg-secondary/50 text-foreground dark:text-secondary-foreground text-xs px-3 py-1 rounded-full hover:bg-secondary/70 transition-colors"
                  >
                    #{label}
                  </Link>
                  {index < post.labels.length - 1 && ", "}
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
    </div>
  );
}
