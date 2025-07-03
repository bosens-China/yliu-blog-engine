import { getColumns, getPostById } from "@/lib/data";
import Link from "next/link";
import { BookOpen, Calendar, ChevronRight } from "lucide-react";
import type { Post } from "@/types";
import { format } from "date-fns";

export default function ColumnsPage() {
  const columns = getColumns();

  return (
    <div className="container mx-auto pt-6">
      <div className="max-w-5xl mx-auto bg-white dark:bg-card rounded-lg shadow-sm p-6 border border-border/20">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">所有专栏</h1>
          <p className="text-muted-foreground">
            共 {columns.length} 个专栏系列
          </p>
        </header>

        {columns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {columns.map((column) => {
              const columnPosts = column.posts
                .map((id) => getPostById(id))
                .filter((p): p is Post => p !== null);

              // 确保日期是有效的
              const hasValidDate =
                column.lastUpdated &&
                !isNaN(new Date(column.lastUpdated).getTime());

              return (
                <div
                  key={column.name}
                  className="bg-white dark:bg-card rounded-lg border border-border hover:border-primary hover:shadow-sm transition-all group overflow-hidden flex flex-col"
                >
                  <Link
                    href={`/column/${encodeURIComponent(column.name)}`}
                    className="p-5"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <h2 className="text-lg font-medium group-hover:text-primary transition-colors">
                        {column.name}
                      </h2>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span>{columnPosts.length} 篇文章</span>
                      {hasValidDate && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {format(new Date(column.lastUpdated), "yyyy-MM-dd")}
                        </span>
                      )}
                    </div>

                    <ul className="space-y-1 mb-3 text-sm text-muted-foreground">
                      {columnPosts.slice(0, 2).map((post) => (
                        <li key={post.id} className="truncate">
                          • {post.title}
                        </li>
                      ))}
                      {columnPosts.length > 2 && (
                        <li className="text-xs text-primary flex items-center gap-1">
                          查看全部 {columnPosts.length} 篇文章...{" "}
                          <ChevronRight size={14} />
                        </li>
                      )}
                    </ul>
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground">暂无专栏。</p>
        )}
      </div>
    </div>
  );
}
