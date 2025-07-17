'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Menu, X, Sun, Moon, Search } from 'lucide-react';
import SearchModal from './SearchModal';
import MobileMenu from './MobileMenu';
import { usePathname } from 'next/navigation';
import { getBlogData, getHeaderConfig } from '@/lib/data';
import type { MenuItem } from '@/types';

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

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 关闭菜单当路由变化时
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const blogData = getBlogData();
  const blogTitle = blogData.metadata.title;
  const headerConfig = getHeaderConfig();

  // 生成菜单项的URL和显示状态
  const getMenuItemProps = (item: MenuItem) => {
    switch (item.type) {
      case 'builtin':
        switch (item.builtin) {
          case 'latest':
            return {
              href: '/page/1',
              show: true,
            };
          case 'categories':
            return {
              href: '/categories',
              show: blogData && blogData.labels.length > 0,
            };
          case 'columns':
            return {
              href: '/columns',
              show: blogData && blogData.columns.length > 0,
            };
          case 'about':
            return {
              href: '/about',
              show: blogData && !!blogData.about,
            };
          default:
            return { href: '/', show: false };
        }
      case 'label':
        return {
          href: `/category/${item.label!}`,
          show:
            blogData &&
            blogData.labels.some(
              (label) => label.name.toLowerCase() === item.label!.toLowerCase(),
            ),
        };
      default:
        return { href: '/', show: false };
    }
  };

  // 生成导航链接
  const navLinks = headerConfig.items
    .map((item: MenuItem) => {
      const props = getMenuItemProps(item);
      return {
        href: props.href,
        text: item.text,
        show: item.show !== false && props.show,
        type: item.type,
      };
    })
    .filter((link) => link.show);

  // 检查链接是否活跃
  const isLinkActive = (href: string, type: string) => {
    if (href === '/page/1' && pathname === '/') return true;
    if (href === '/page/1' && pathname.startsWith('/page')) return true;
    if (type === 'label' && href.startsWith('/category/')) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // 切换主题函数
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full border-b border-border bg-white dark:bg-background/95 backdrop-blur-md transition-all print:hidden ${
          scrolled ? 'shadow-sm' : ''
        }`}
      >
        <div className="px-4">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="text-xl font-bold text-foreground flex items-center"
            >
              {blogTitle}
            </Link>

            <div className="flex items-center space-x-1 sm:space-x-2">
              <nav className="hidden md:flex items-center mr-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm px-4 py-2 rounded-md transition-colors ${
                      isLinkActive(link.href, link.type)
                        ? 'text-primary font-medium'
                        : 'text-foreground/70 dark:text-foreground/80 hover:text-foreground'
                    }`}
                  >
                    {link.text}
                  </Link>
                ))}
              </nav>

              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-foreground/70 dark:text-foreground/80 hover:text-foreground transition-colors rounded-full hover:bg-muted/50"
                aria-label="搜索"
                title="搜索文章"
              >
                <Search size={20} />
              </button>

              {/* 主题切换按钮 */}
              <button
                onClick={toggleTheme}
                className="p-2 text-foreground/70 dark:text-foreground/80 hover:text-foreground transition-colors rounded-full hover:bg-muted/50"
                aria-label={
                  theme === 'dark' ? '切换到明亮模式' : '切换到暗黑模式'
                }
                title={theme === 'dark' ? '切换到明亮模式' : '切换到暗黑模式'}
              >
                {mounted &&
                  (theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />)}
              </button>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-foreground/70 dark:text-foreground/80 hover:text-foreground rounded-full hover:bg-muted/50"
                aria-label={isMenuOpen ? '关闭菜单' : '打开菜单'}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 使用新的移动端菜单组件 */}
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        navLinks={navLinks}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
