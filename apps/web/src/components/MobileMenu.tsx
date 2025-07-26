import { useTheme } from 'next-themes';
import Link from 'next/link';
import { X, Sun, Moon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useClickAway } from 'ahooks';
import GitHubIcon from './icons/GitHubIcon';

interface NavLink {
  href: string;
  text: string;
  show: boolean;
  type: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: NavLink[];
  githubUrl?: string | null;
}

export default function MobileMenu({
  isOpen,
  onClose,
  navLinks,
  githubUrl,
}: MobileMenuProps) {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  useClickAway(() => {
    if (isOpen) {
      onClose();
    }
  }, menuRef);

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

  // 当菜单打开时，禁止body滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] md:hidden">
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="absolute inset-0 bg-black/20 dark:bg-black/50"
            onClick={onClose}
          />

          {/* 菜单内容 */}
          <motion.div
            ref={menuRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'tween',
              duration: 0.1,
              ease: 'easeOut',
            }}
            className="absolute right-0 top-0 h-full w-4/5 max-w-xs mobile-menu-bg border-l border-border shadow-xl flex flex-col"
          >
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h2 className="font-semibold">菜单</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-muted/50"
                aria-label="关闭菜单"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    'flex items-center px-4 py-3 rounded-md text-base transition-colors',
                    {
                      'text-primary font-medium': isLinkActive(
                        link.href,
                        link.type,
                      ),
                      'text-muted-foreground hover:text-foreground':
                        !isLinkActive(link.href, link.type),
                    },
                  )}
                  onClick={onClose}
                >
                  {link.text}
                </Link>
              ))}

              {/* GitHub 链接 */}
              {githubUrl && (
                <div className="pt-4 mt-4 border-t border-border">
                  <div className="px-3 py-2 text-xs text-muted-foreground">
                    源码仓库
                  </div>
                  <Link
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-md text-base text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-primary">
                      <GitHubIcon size={18} />
                    </span>
                    查看 GitHub 仓库
                  </Link>
                </div>
              )}

              <div className="pt-4 mt-4 border-t border-border">
                <div className="px-3 py-2 text-xs text-muted-foreground">
                  主题设置
                </div>
                <button
                  onClick={() => {
                    toggleTheme();
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-md text-base text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <span className="text-primary">
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                  </span>
                  {theme === 'dark' ? '切换到明亮模式' : '切换到暗黑模式'}
                </button>
              </div>
            </nav>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
