"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Clock, Tag, X } from "lucide-react";
import { searchPosts, getLabels } from "@/lib/data";
import type { Post } from "@/types";
import Link from "next/link";
import { format } from "date-fns";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [hotTags, setHotTags] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      // 从localStorage加载最近搜索
      const saved = localStorage.getItem("recent-searches");
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }

      // 获取热门标签（取前5个）
      try {
        const labels = getLabels();
        setHotTags(labels.slice(0, 5).map((label) => label.name));
      } catch (error) {
        console.warn("获取标签失败:", error);
        setHotTags(["JavaScript", "React", "TypeScript", "Node.js", "CSS"]);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    const debounceTimer = setTimeout(() => {
      try {
        const results = searchPosts(query);
        setSearchResults(results.posts.slice(0, 5)); // 只显示前5条结果
      } catch (error) {
        console.error("搜索失败:", error);
        setSearchResults([]);
      }
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // 保存到最近搜索
    const newRecentSearches = [
      searchQuery,
      ...recentSearches.filter((s) => s !== searchQuery),
    ].slice(0, 5);

    setRecentSearches(newRecentSearches);
    localStorage.setItem("recent-searches", JSON.stringify(newRecentSearches));

    setQuery(searchQuery);
  };

  const handlePostClick = (postId: number) => {
    router.push(`/post/${postId}`);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div className="w-full max-w-2xl mx-4 bg-card rounded-lg shadow-xl border border-border overflow-hidden">
        {/* 搜索框 */}
        <div className="flex items-center px-4 py-4 border-b border-border">
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
            onClick={onClose}
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
              {recentSearches.length > 0 && (
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
                        className="px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-md border border-border/50 transition-colors"
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
                      className="px-3 py-1.5 text-sm bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors"
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
                    显示前 {searchResults.length} 条结果
                  </div>
                  {searchResults.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => handlePostClick(post.id)}
                      className="block p-4 rounded-lg border border-border/50 hover:border-primary hover:bg-primary/5 transition-all group cursor-pointer"
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
                            {format(new Date(post.createdAt), "yyyy年MM月dd日")}
                          </span>
                          <span>阅读时间 {post.readingTime} 分钟</span>
                        </div>

                        {post.labels.length > 0 && (
                          <Link
                            href={`/category/${encodeURIComponent(
                              post.labels[0]
                            )}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onClose();
                            }}
                            className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full hover:bg-secondary/80 transition-colors"
                          >
                            <Tag size={12} />
                            <span>{post.labels[0]}</span>
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
                  <p className="text-foreground font-medium">未找到相关文章</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    试试其他关键词或查看热门标签
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 底部提示 */}
        <div className="px-6 py-3 border-t border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center text-xs text-muted-foreground space-x-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs">
                ESC
              </kbd>
              关闭
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs">
                Enter
              </kbd>
              搜索
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
