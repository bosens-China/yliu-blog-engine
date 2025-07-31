import { getLabels, getPostsByLabelId } from '@/lib/data';
import { notFound } from 'next/navigation';
import PostCard from '@/components/PostCard';
import Pagination from '@/components/Pagination';

// 占位符，防止为空时构建失败
const NO_LABELS_PLACEHOLDER = -999;

interface Params {
  id: string;
}

// 预构建所有分类页面
export async function generateStaticParams(): Promise<Params[]> {
  const labels = getLabels();

  // 如果没有分类，返回一个占位符以防止构建失败
  if (labels.length === 0) {
    return [{ id: NO_LABELS_PLACEHOLDER.toString() }];
  }

  return labels.map((label) => ({
    id: label.id.toString(),
  }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const id = Number((await params).id);

  // 如果是占位符，直接返回 404
  if (id === NO_LABELS_PLACEHOLDER) {
    return notFound();
  }

  // 在静态导出模式下，我们只生成第一页，分页将通过客户端路由处理
  const { posts, totalPages, total } = getPostsByLabelId(id, 1, 12);
  const labels = getLabels();
  const currentLabel = labels.find((label) => label.id === id);

  if (!currentLabel) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto">
      <header className="page-content-bg rounded-lg shadow-sm p-6 border border-border/20 mb-8">
        <h1 className="text-3xl font-bold mb-2">#{currentLabel.name}</h1>
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
          createHref={(page) => `/category/${id}?page=${page}`}
        />
      )}
    </div>
  );
}
