'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { List, ChevronDown, ChevronUp } from 'lucide-react';
import { remark } from 'remark';
import { visit } from 'unist-util-visit';
import type { Heading } from 'mdast';
import clsx from 'clsx';
import { useBoolean, useScroll, useClickAway } from 'ahooks';
import { useTheme } from 'next-themes';

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  variant?: 'sidebar' | 'floating';
}

// 提取出的共享组件
const TableOfContentsList = ({
  headings,
  activeId,
  handleHeadingClick,
}: {
  headings: HeadingItem[];
  activeId: string;
  handleHeadingClick: (id: string) => void;
}) => (
  <nav className="px-2 py-3 max-h-80">
    <ul className="space-y-1">
      {headings.map(({ id, text, level }) => (
        <li key={id}>
          <button
            onClick={() => handleHeadingClick(id)}
            className={clsx(
              'block w-full text-left px-3 py-2 text-sm rounded-md transition-all duration-200',
              'hover:bg-accent/70 hover:text-foreground group',
              activeId === id
                ? 'bg-primary/10 text-primary border-l-2 border-primary'
                : 'text-muted-foreground border-l-2 border-transparent hover:border-accent',
              level === 1 && 'font-semibold',
              level === 2 && 'ml-4 font-medium',
              level === 3 && 'ml-8 text-xs',
            )}
            title={text}
          >
            <span className="block leading-relaxed break-words line-clamp-2">
              {text}
            </span>
          </button>
        </li>
      ))}
    </ul>
  </nav>
);

export default function TableOfContents({
  content,
  variant = 'sidebar',
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [isCollapsed, { toggle: toggleCollapse, set: setIsCollapsed }] =
    useBoolean(false);
  const { theme } = useTheme();
  const floatingMenuRef = useRef<HTMLDivElement>(null);

  useClickAway(() => {
    if (variant === 'floating' && !isCollapsed) {
      setIsCollapsed(true);
    }
  }, floatingMenuRef);

  useEffect(() => {
    const updateCollapseState = () => {
      const isMobile = window.innerWidth < 1024;
      if (variant === 'sidebar') {
        setIsCollapsed(isMobile);
      } else {
        setIsCollapsed(true);
      }
    };
    updateCollapseState();
    window.addEventListener('resize', updateCollapseState);
    return () => window.removeEventListener('resize', updateCollapseState);
  }, [setIsCollapsed, variant]);

  // 使用 remark AST 解析标题
  const headings = useMemo(() => {
    const extractedHeadings: HeadingItem[] = [];
    try {
      const tree = remark().parse(content);
      visit(tree, 'heading', (node: Heading) => {
        if (node.depth <= 3) {
          const extractText = (nodes: typeof node.children): string =>
            nodes
              .map((child) => {
                if ('value' in child) return child.value;
                if ('children' in child) return extractText(child.children);
                return '';
              })
              .join('');
          const text = extractText(node.children).trim();
          if (text) {
            const id = text
              .toLowerCase()
              .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-')
              .replace(/^-|-$/g, '');
            extractedHeadings.push({ id, text, level: node.depth });
          }
        }
      });
    } catch (error) {
      console.error('解析 markdown 失败:', error);
    }
    return extractedHeadings;
  }, [content]);

  // 只保留点击目录滚动逻辑
  const handleHeadingClick = (id: string) => {
    setActiveId(id);

    // 平滑滚动到对应锚点
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }

    // 点击后收起浮动目录
    if (variant === 'floating') setIsCollapsed(true);
  };

  const scroll = useScroll(typeof window !== 'undefined' ? document : null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const arr = entries.filter((entry) => entry.intersectionRatio > 0);
      // 取最后一个
      const last = arr[arr.length - 1];
      if (last) {
        setActiveId(last.target.id);
      }
    }, {});
    const fn = async () => {
      await Promise.resolve();
      headings.forEach((heading) => {
        const element = document.getElementById(heading.id);
        if (element) {
          observer.observe(element);
        }
      });
    };
    fn();

    return () => observer.disconnect();
  }, [scroll, headings]);

  if (headings.length === 0) {
    return null;
  }

  const floatingTocStyle = theme === 'dark' 
    ? { backgroundColor: 'rgba(23, 25, 29, 1)' } 
    : {};

  if (variant === 'floating') {
    return (
      <div className="fixed bottom-24 right-6 z-50" ref={floatingMenuRef}>
        <div className="page-content-bg rounded-lg border border-border/30 shadow-lg backdrop-blur-sm">
          <button
            onClick={toggleCollapse}
            className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-foreground hover:bg-accent/50 transition-colors rounded-lg"
            aria-label={isCollapsed ? '展开目录' : '收起目录'}
          >
            <List size={16} />
            <span className="hidden sm:inline">目录</span>
            {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
          <div
            className={clsx(
              'absolute bottom-full right-0 mb-2 transition-all duration-300 ease-in-out',
              isCollapsed
                ? 'opacity-0 pointer-events-none translate-y-2'
                : 'opacity-100 translate-y-0',
            )}
          >
            <div
              className="w-72 max-w-[calc(100vw-3rem)] page-content-bg rounded-lg border border-border/30 shadow-lg backdrop-blur-sm overflow-hidden"
              style={floatingTocStyle}
            >
              <div className="px-4 py-3 border-b border-border/20">
                <span className="text-sm font-medium text-foreground">
                  文章目录
                </span>
              </div>
              <TableOfContentsList
                headings={headings}
                activeId={activeId}
                handleHeadingClick={handleHeadingClick}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <aside className="sticky top-24 w-72 h-fit shrink-0">
      <div className="page-content-bg rounded-lg border border-border/30 shadow-sm backdrop-blur-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
          <div className="flex items-center gap-2">
            <List size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">目录</span>
          </div>
          <button
            onClick={toggleCollapse}
            className="p-1 rounded-md hover:bg-accent/50 transition-colors"
            aria-label={isCollapsed ? '展开目录' : '收起目录'}
          >
            {isCollapsed ? (
              <ChevronDown size={16} className="text-muted-foreground" />
            ) : (
              <ChevronUp size={16} className="text-muted-foreground" />
            )}
          </button>
        </div>
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isCollapsed ? 'max-h-0' : 'max-h-96'
          }`}
        >
          <TableOfContentsList
            headings={headings}
            activeId={activeId}
            handleHeadingClick={handleHeadingClick}
          />
        </div>
      </div>
    </aside>
  );
}

