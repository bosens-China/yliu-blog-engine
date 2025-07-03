"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Menu, X, Sun, Moon, Search } from "lucide-react";
import SearchModal from "./SearchModal";
import MobileMenu from "./MobileMenu";
import { usePathname } from "next/navigation";
import { getBlogData } from "@/lib/data";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);

    // 添加滚动监听
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 关闭菜单当路由变化时
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const repo = process.env.NEXT_PUBLIC_GITHUB_REPOSITORY;
  const owner = repo ? repo.split("/")[0] : "作者";
  const defaultTitle = `${owner}的个人博客`;
  const blogTitle = process.env.NEXT_PUBLIC_BLOG_TITLE || defaultTitle;

  const blogData = getBlogData();

  const navLinks = [
    { href: "/page/1", text: "最新文章", show: true },
    {
      href: "/categories",
      text: "分类",
      show: blogData && blogData.labels.length > 0,
    },
    {
      href: "/columns",
      text: "专栏",
      show: blogData && blogData.columns.length > 0,
    },
    { href: "/about", text: "关于我", show: blogData && !!blogData.about },
  ];

  // 检查链接是否活跃
  const isLinkActive = (href: string) => {
    if (href === "/page/1" && pathname === "/") return true;
    if (href === "/page/1" && pathname.startsWith("/page")) return true;
    return pathname.startsWith(href);
  };

  // 切换主题函数
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full border-b border-border bg-white dark:bg-background/95 backdrop-blur-md transition-all print:hidden ${
          scrolled ? "shadow-sm" : ""
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="text-xl font-bold text-foreground flex items-center"
            >
              {blogTitle}
            </Link>

            <div className="flex items-center space-x-1 sm:space-x-2">
              <nav className="hidden md:flex items-center mr-2">
                {navLinks
                  .filter((link) => link.show)
                  .map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`text-sm px-4 py-2 rounded-md transition-colors ${
                        isLinkActive(link.href)
                          ? "text-primary font-medium"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {link.text}
                    </Link>
                  ))}
              </nav>

              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted/50"
                aria-label="搜索"
              >
                <Search size={20} />
              </button>

              {/* 主题切换按钮 */}
              <button
                onClick={toggleTheme}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted/50"
                aria-label={
                  theme === "dark" ? "切换到明亮模式" : "切换到暗黑模式"
                }
              >
                {mounted &&
                  (theme === "dark" ? <Sun size={20} /> : <Moon size={20} />)}
              </button>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50"
                aria-label={isMenuOpen ? "关闭菜单" : "打开菜单"}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 使用新的移动端菜单组件 */}
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
