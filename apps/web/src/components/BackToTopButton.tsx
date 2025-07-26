'use client';

import { useScroll } from 'ahooks';
import { ArrowUp } from 'lucide-react';
import clsx from 'clsx';

export default function BackToTopButton() {
  const scroll = useScroll();
  const isVisible = scroll && scroll.top > 500;

  // 滚动到顶部
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={clsx(
        'fixed right-6 bottom-6 sm:right-8 sm:bottom-8 z-40',
        'bg-primary/90 hover:bg-primary text-primary-foreground',
        'p-3 rounded-full shadow-lg transition-all duration-300 print:hidden',
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-10 pointer-events-none',
      )}
      aria-label="回到顶部"
    >
      <ArrowUp size={20} className="text-white dark:text-white" />
      <span className="sr-only">回到顶部</span>
    </button>
  );
}
