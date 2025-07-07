import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  /**
   * 当前页码
   */
  currentPage: number;
  /**
   * 总页数
   */
  totalPages: number;
  /**
   * 生成页面链接的函数
   * @param page 页码
   * @returns 链接URL
   */
  createHref: (page: number) => string;
}

export default function Pagination({
  currentPage,
  totalPages,
  createHref,
}: PaginationProps) {
  // 如果只有一页，不显示分页
  if (totalPages <= 1) {
    return null;
  }

  // 生成要显示的页码数组
  const getPageNumbers = () => {
    const pageNumbers: number[] = [];
    const pageWindowSize = 5; // 最多显示5个页码

    if (totalPages <= pageWindowSize) {
      // 如果总页数小于等于5，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // 计算页码窗口的起始页
      let startPage = Math.max(1, currentPage - 2);
      // 计算页码窗口的结束页
      const endPage = Math.min(totalPages, startPage + pageWindowSize - 1);

      // 如果结束页码触底，重新计算起始页码
      if (endPage === totalPages) {
        startPage = Math.max(1, totalPages - pageWindowSize + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-wrap justify-center items-center gap-3 py-6">
      {/* 上一页按钮 */}
      {currentPage > 1 ? (
        <Link
          href={createHref(currentPage - 1)}
          className="flex items-center justify-center w-9 h-9 rounded-md border border-border page-content-bg hover:bg-muted/50 transition-colors"
          aria-label="上一页"
        >
          <ChevronLeft size={16} />
        </Link>
      ) : (
        <button
          disabled
          className="flex items-center justify-center w-9 h-9 rounded-md border border-border page-content-bg text-muted-foreground cursor-not-allowed opacity-50"
          aria-label="上一页"
        >
          <ChevronLeft size={16} />
        </button>
      )}

      {/* 页码 */}
      <div className="flex flex-wrap gap-1.5">
        {pageNumbers.map((pageNum) => {
          const isCurrentPage = pageNum === currentPage;

          return isCurrentPage ? (
            <span
              key={pageNum}
              className="flex items-center justify-center w-9 h-9 rounded-md bg-primary text-white dark:text-white font-medium text-sm"
              aria-current="page"
            >
              {pageNum}
            </span>
          ) : (
            <Link
              key={pageNum}
              href={createHref(pageNum)}
              className="flex items-center justify-center w-9 h-9 rounded-md border border-border page-content-bg hover:bg-muted/50 transition-colors text-sm"
            >
              {pageNum}
            </Link>
          );
        })}
      </div>

      {/* 下一页按钮 */}
      {currentPage < totalPages ? (
        <Link
          href={createHref(currentPage + 1)}
          className="flex items-center justify-center w-9 h-9 rounded-md border border-border page-content-bg hover:bg-muted/50 transition-colors"
          aria-label="下一页"
        >
          <ChevronRight size={16} />
        </Link>
      ) : (
        <button
          disabled
          className="flex items-center justify-center w-9 h-9 rounded-md border border-border page-content-bg text-muted-foreground cursor-not-allowed opacity-50"
          aria-label="下一页"
        >
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}
