import { useTheme } from "next-themes";
import Link from "next/link";
import { X, Sun, Moon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getBlogData } from "@/lib/data";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  // 检查链接是否活跃
  const isLinkActive = (href: string) => {
    if (href === "/page/1" && pathname === "/") return true;
    if (href === "/page/1" && pathname.startsWith("/page")) return true;
    return pathname.startsWith(href);
  };

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

  // 切换主题函数
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // 当菜单打开时，禁止body滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 z-50 md:hidden bg-black/20 dark:bg-black/50 backdrop-blur-sm ${
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{ transition: "opacity 0.2s ease" }}
    >
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "tween",
              duration: 0.15,
              ease: "easeOut",
            }}
            className="absolute right-0 top-0 h-full w-4/5 max-w-xs bg-card border-l border-border shadow-xl flex flex-col"
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
              {navLinks
                .filter((link) => link.show)
                .map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center px-4 py-3 rounded-md text-base transition-colors ${
                      isLinkActive(link.href)
                        ? "text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={onClose}
                  >
                    {link.text}
                  </Link>
                ))}

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
                    {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                  </span>
                  {theme === "dark" ? "切换到明亮模式" : "切换到暗黑模式"}
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
