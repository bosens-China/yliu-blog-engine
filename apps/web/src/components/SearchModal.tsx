'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Clock, Tag, X } from 'lucide-react';
import { searchPosts, getLabels } from '@/lib/data';
import type { Post } from '@yliu/types/blog';
import Link from 'next/link';
import { format } from 'date-fns';
import { useLocalStorageState, useKeyPress, useClickAway } from 'ahooks';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useLocalStorageState<string[]>(
    'recent-searches',
    {
      defaultValue: [],
    },
  );
  const [hotTags, setHotTags] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const desktopModalRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  useKeyPress('Escape', () => {
    if (isOpen) {
      handleForceClose();
    }
  });

  // PC端点击外部关闭 - 只有在input没有值时才关闭
  useClickAway(() => {
    if (window.innerWidth >= 640 && query.trim() === '') {
      onClose();
    }
  }, desktopModalRef);

  // 禁止/恢复页面滚动
  useEffect(() => {
    if (isOpen) {
      // 只在PC和平板上禁止滚动
      if (window.innerWidth >= 640) {
        document.body.style.overflow = 'hidden';
      }
      inputRef.current?.focus();
      // 获取热门标签（取前5个）
      try {
        const labels = getLabels();
        setHotTags(labels.slice(0, 5).map((label) => label.name));
      } catch (error) {
        console.warn('获取标签失败:', error);
        setHotTags(['JavaScript', 'React', 'TypeScript', 'Node.js', 'CSS']);
      }
    } else {
      // 恢复滚动
      document.body.style.overflow = '';
    }

    // 清理函数
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = searchPosts(query);
      setSearchResults(results.posts);
    } catch (error) {
      console.error('搜索失败:', error);
      setSearchResults([]);
    }
    setIsLoading(false);
  }, [query]);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // 保存到最近搜索
    const newRecentSearches = [
      searchQuery,
      ...(recentSearches?.filter((s) => s !== searchQuery) || []),
    ].slice(0, 5);

    setRecentSearches(newRecentSearches);
    setQuery(searchQuery);
  };

  const handlePostClick = (postId: number) => {
    router.push(`/post/${postId}`);
    handleForceClose();
  };

  const handleClose = () => {
    // 如果输入框有内容，先清空
    if (query.trim()) {
      setQuery('');
      setSearchResults([]);
      setIsLoading(false);
      // 让输入框重新获得焦点
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    } else {
      // 如果没有内容，关闭弹窗
      onClose();
    }
  };

  const handleForceClose = () => {
    // 强制关闭弹窗（重置所有状态）
    setQuery('');
    setSearchResults([]);
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm">
      {/* 桌面端搜索框 */}
      <div
        ref={desktopModalRef}
        className="hidden sm:flex w-full max-w-2xl mx-4 mt-24 bg-background/95 rounded-lg shadow-xl border border-border/20 overflow-hidden backdrop-blur-sm"
      >
        {/* 搜索框 */}
        <div className="w-full">
          <div className="flex items-center px-4 py-4 border-b border-border/20 dark:border-border/30">
            <Search className="w-5 h-5 text-muted-foreground mr-3" />
            <input
              ref={inputRef}
              type="text"
              placeholder="搜索文章..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            />
            <button
              onClick={handleClose}
              className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* 内容区域 */}
          <div className="max-h-[60vh] overflow-y-auto">
            {!query && (
              <div className="p-6 space-y-6">
                {/* 最近搜索 */}
                {recentSearches && recentSearches.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-3 flex items-center">
                      <Clock size={16} className="mr-2 text-primary" />
                      最近搜索
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearch(search)}
                          className="px-3 py-1.5 text-sm bg-muted/80 dark:bg-muted/40 hover:bg-muted dark:hover:bg-muted/60 text-muted-foreground hover:text-foreground rounded-md border border-border/30 dark:border-border/20 transition-colors"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 热门标签 */}
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-3 flex items-center">
                    <Tag size={16} className="mr-2 text-primary" />
                    热门标签
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {hotTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleSearch(tag)}
                        className="px-3 py-1.5 text-sm bg-primary/10 dark:bg-primary/20 text-primary hover:bg-primary/20 dark:hover:bg-primary/30 rounded-md transition-colors"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 搜索结果 */}
            {query && (
              <div className="p-6">
                {isLoading ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-muted-foreground border-t-transparent mb-2"></div>
                    <p>搜索中...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground mb-3">
                      共找到 {searchResults.length} 条结果
                    </div>
                    {searchResults.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => handlePostClick(post.id)}
                        className="block p-4 rounded-lg border border-border/30 dark:border-border/20 hover:border-primary/50 dark:hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all group cursor-pointer"
                      >
                        <h4 className="font-medium text-foreground mb-1.5 line-clamp-1 group-hover:text-primary transition-colors">
                          {post.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center text-muted-foreground space-x-3">
                            <span>
                              {format(
                                new Date(post.createdAt),
                                'yyyy年MM月dd日',
                              )}
                            </span>
                            <span>阅读时间 {post.readingTime} 分钟</span>
                          </div>

                          {post.labels.length > 0 && (
                            <Link
                              href={`/category/${post.labels[0].id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleForceClose();
                              }}
                              className="flex items-center gap-1 bg-muted/80 dark:bg-muted/40 text-foreground px-2 py-0.5 rounded-full hover:bg-muted dark:hover:bg-muted/60 transition-colors"
                            >
                              <Tag size={12} />
                              <span>{post.labels[0].name}</span>
                              {post.labels.length > 1 && (
                                <span>+{post.labels.length - 1}</span>
                              )}
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-foreground font-medium">
                      未找到相关文章
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      试试其他关键词或查看热门标签
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 底部提示 */}
          <div className="px-6 py-3 border-t border-border/20 dark:border-border/30 bg-muted/20 dark:bg-muted/10 flex items-center justify-between">
            <div className="flex items-center text-xs text-muted-foreground space-x-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-muted/80 dark:bg-muted/40 border border-border/30 dark:border-border/20 rounded text-xs">
                  ESC
                </kbd>
                关闭
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-muted/80 dark:bg-muted/40 border border-border/30 dark:border-border/20 rounded text-xs">
                  Enter
                </kbd>
                搜索
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 移动端全屏搜索界面 */}
      <div className="sm:hidden w-full h-full bg-background flex flex-col">
        {/* 搜索框 */}
        <div className="flex items-center p-4 border-b border-border/20 bg-background">
          <Search className="w-5 h-5 text-muted-foreground mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="搜索文章..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-base"
          />
          <button
            onClick={handleClose}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 内容区域 - 移动端 */}
        <div className="flex-1 overflow-y-auto">
          {!query && (
            <div className="p-4 space-y-6">
              {/* 最近搜索 */}
              {recentSearches && recentSearches.length > 0 && (
                <div>
                  <h3 className="text-base font-medium text-foreground mb-3 flex items-center">
                    <Clock size={18} className="mr-2 text-primary" />
                    最近搜索
                  </h3>
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(search)}
                        className="w-full text-left px-4 py-3 bg-muted/50 dark:bg-muted/30 hover:bg-muted dark:hover:bg-muted/50 text-foreground rounded-lg border border-border/20 dark:border-border/20 transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 热门标签 */}
              <div>
                <h3 className="text-base font-medium text-foreground mb-3 flex items-center">
                  <Tag size={18} className="mr-2 text-primary" />
                  热门标签
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {hotTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleSearch(tag)}
                      className="px-4 py-3 text-left bg-primary/10 dark:bg-primary/20 text-primary hover:bg-primary/20 dark:hover:bg-primary/30 rounded-lg transition-colors"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 搜索结果 - 移动端 */}
          {query && (
            <div className="p-4">
              {isLoading ? (
                <div className="text-center py-20 text-muted-foreground">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-muted-foreground border-t-transparent mb-4"></div>
                  <p>搜索中...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground mb-4">
                    共找到 {searchResults.length} 条结果
                  </div>
                  {searchResults.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => handlePostClick(post.id)}
                      className="block p-4 rounded-lg border border-border/30 dark:border-border/20 hover:border-primary/50 dark:hover:border-primary/30 bg-white dark:bg-gray-800/50 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all group cursor-pointer"
                    >
                      <h4 className="font-medium text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex flex-col space-y-1 text-muted-foreground">
                          <span>
                            {format(new Date(post.createdAt), 'yyyy年MM月dd日')}
                          </span>
                          <span>阅读时间 {post.readingTime} 分钟</span>
                        </div>

                        {post.labels.length > 0 && (
                          <Link
                            href={`/category/${post.labels[0].id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleForceClose();
                            }}
                            className="flex items-center gap-1 bg-muted/80 dark:bg-muted/40 text-foreground px-2 py-1 rounded-full hover:bg-muted dark:hover:bg-muted/60 transition-colors"
                          >
                            <Tag size={12} />
                            <span>{post.labels[0].name}</span>
                            {post.labels.length > 1 && (
                              <span>+{post.labels.length - 1}</span>
                            )}
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <Search className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-50" />
                  <p className="text-foreground font-medium text-lg">
                    未找到相关文章
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    试试其他关键词或查看热门标签
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
