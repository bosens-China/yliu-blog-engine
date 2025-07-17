import { getLabels, getPostsByLabel } from "@/lib/data";
import { notFound } from "next/navigation";
import PostCard from "@/components/PostCard";
import Pagination from "@/components/Pagination";

// 占位符，防止为空时构建失败
const NO_LABELS_PLACEHOLDER = "no-labels-placeholder";

// 预构建所有分类页面
export async function generateStaticParams() {
  const labels = getLabels();

  // 如果没有分类，返回一个占位符以防止构建失败
  if (labels.length === 0) {
    return [{ name: NO_LABELS_PLACEHOLDER }];
  }

  return labels.map((label) => ({
    name: encodeURIComponent(label.name),
  }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);

  // 如果是占位符，直接返回 404
  if (name === NO_LABELS_PLACEHOLDER) {
    notFound();
  }

  // 在静态导出模式下，我们只生成第一页，分页将通过客户端路由处理
  const { posts, totalPages, total } = getPostsByLabel(decodedName, 1, 12);
  const labels = getLabels();
  const currentLabel = labels.find(
    (label) => label.name.toLowerCase() === decodedName.toLowerCase()
  );

  if (!currentLabel) {
    notFound();
  }

  return (
    <div className="container mx-auto pt-6">
      <div className="max-w-5xl mx-auto">
        <header className="page-content-bg rounded-lg shadow-sm p-6 border border-border/20 mb-8">
          <h1 className="text-3xl font-bold mb-2">#{decodedName}</h1>
          <div className="text-muted-foreground">
            {currentLabel.description && (
              <p className="mb-1">{currentLabel.description}</p>
            )}
            <p>共 {total} 篇文章</p>
          </div>
        </header>

        {posts.length > 0 ? (
          <div className="grid gap-8">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="page-content-bg rounded-lg shadow-sm p-8 text-center py-12 border border-border/20">
            <p className="text-muted-foreground">该分类下暂无文章</p>
          </div>
        )}

        {totalPages > 1 && (
          <Pagination
            currentPage={1}
            totalPages={totalPages}
            createHref={(page) => `/category/${name}?page=${page}`}
          />
        )}
      </div>
    </div>
  );
}
