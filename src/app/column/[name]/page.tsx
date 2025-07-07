import { getColumnByName, getPostsByColumn, getColumns } from "@/lib/data";
import { notFound } from "next/navigation";
import { Calendar, BookOpen, FileText } from "lucide-react";
import { format } from "date-fns";
import Pagination from "@/components/Pagination";
import { Post } from "@/types";
import PostCard from "@/components/PostCard";

// 预构建所有专栏页面
export async function generateStaticParams() {
  const columns = getColumns();
  return columns.map((column) => ({
    name: encodeURIComponent(column.name),
  }));
}

export default async function ColumnPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const column = getColumnByName(decodedName);

  if (!column) {
    notFound();
  }

  // 在静态导出模式下，我们只生成第一页，分页将通过客户端路由处理
  const { posts, totalPages } = getPostsByColumn(decodedName, 1, 10);

  // 确保日期是有效的
  const hasValidDate =
    column.lastUpdated && !isNaN(new Date(column.lastUpdated).getTime());

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="max-w-5xl mx-auto">
        <header className="page-content-bg rounded-lg p-6 border border-border/20 dark:border-transparent mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">{decodedName}</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <FileText size={16} />
              {column.posts.length} 篇文章
            </span>
            {hasValidDate && (
              <span className="flex items-center gap-1">
                <Calendar size={16} />
                最后更新:{" "}
                {format(new Date(column.lastUpdated), "yyyy年MM月dd日")}
              </span>
            )}
          </div>
          {column.description && (
            <div className="mt-3 text-muted-foreground">
              <p>{column.description}</p>
            </div>
          )}
        </header>

        <div className="grid gap-8 mt-8">
          {posts.map((post: Post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={1}
            totalPages={totalPages}
            createHref={(p) => `/column/${name}?page=${p}`}
          />
        )}
      </div>
    </div>
  );
}
