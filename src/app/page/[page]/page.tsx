import { getPosts } from "@/lib/data";
import PostCard from "@/components/PostCard";
import Pagination from "@/components/Pagination";

interface PageProps {
  params: Promise<{
    page: string;
  }>;
}

// 预渲染前5页
export async function generateStaticParams() {
  const { totalPages } = getPosts(1);
  return Array.from({ length: Math.min(5, totalPages) }, (_, i) => ({
    page: (i + 1).toString(),
  }));
}

export default async function Page({ params }: PageProps) {
  const { page } = await params;
  const currentPage = parseInt(page, 10);
  const { posts, totalPages } = getPosts(currentPage);

  return (
    <div className="container mx-auto pt-6">
      {/* 文章列表 */}
      <section className="max-w-5xl mx-auto">
        <div className="grid gap-8">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      {/* 使用新的分页组件 */}
      {totalPages > 1 && (
        <div className="max-w-5xl mx-auto">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            createHref={(page) => `/page/${page}`}
          />
        </div>
      )}
    </div>
  );
}
