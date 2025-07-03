"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import PostCard from "./PostCard";
import Pagination from "./Pagination";
import type { Post } from "@/types";

interface ClientPaginationProps {
  posts: Post[];
  totalPages: number;
  itemsPerPage: number;
  basePath: string;
}

export default function ClientPagination({
  posts,
  totalPages,
  itemsPerPage,
  basePath,
}: ClientPaginationProps) {
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPosts, setCurrentPosts] = useState<Post[]>([]);

  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1", 10);
    setCurrentPage(page);

    // 计算当前页的文章
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setCurrentPosts(posts.slice(startIndex, endIndex));
  }, [searchParams, posts, itemsPerPage]);

  return (
    <>
      {currentPosts.length > 0 ? (
        <div className="grid gap-8">
          {currentPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-card rounded-lg shadow-sm p-8 text-center py-12 border border-border/20">
          <p className="text-muted-foreground">该页面暂无文章</p>
        </div>
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          createHref={(page) => `${basePath}?page=${page}`}
        />
      )}
    </>
  );
}
