import { getColumns, getPostById } from '@/lib/data';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import type { Post } from '@yliu/types/blog';
import { format } from 'date-fns';

export default function ColumnsPage() {
  const columns = getColumns();

  return (
    <div className="max-w-5xl mx-auto page-content-bg rounded-lg p-6 border border-border/20 dark:border-transparent">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <BookOpen className="w-7 h-7 text-primary" />
          所有专栏
        </h1>
        <p className="text-muted-foreground">
          共 {columns.length} 个专栏系列
        </p>
      </header>

      {columns.length > 0 ? (
        <div className="space-y-6">
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
                className="border-b border-border/20 dark:border-border/10 pb-6 last:border-b-0 last:pb-0"
              >
                <Link
                  href={`/column/${encodeURIComponent(column.name)}`}
                  className="block group"
                >
                  <h2 className="text-xl font-semibold group-hover:text-primary transition-colors mb-3">
                    {column.name}
                  </h2>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span>{columnPosts.length} 篇文章</span>
                    {hasValidDate && (
                      <span>
                        最后更新：
                        {format(
                          new Date(column.lastUpdated),
                          'yyyy年MM月dd日',
                        )}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
                    {columnPosts.map((post) => (
                      <div
                        key={post.id}
                        className="truncate hover:text-foreground transition-colors"
                      >
                        • {post.title}
                      </div>
                    ))}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-12">暂无专栏。</p>
      )}
    </div>
  );
}
