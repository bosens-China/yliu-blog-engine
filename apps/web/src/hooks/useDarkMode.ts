import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

/**
 * 可靠的 dark 模式检测 hook
 * 结合多种检测方式，确保在 system 模式下也能正确识别 dark 状态
 */
export function useDarkMode() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 使用原生 API 检测系统暗色模式偏好
  const [prefersDark, setPrefersDark] = useState(false);

  // 检测 DOM 中的 dark 类
  const [hasDarkClass, setHasDarkClass] = useState(false);

  useEffect(() => {
    setMounted(true);

    // 检测系统暗色模式偏好
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setPrefersDark(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setPrefersDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleMediaChange);

    // 检测 document.documentElement 是否有 dark 类
    const checkDarkClass = () => {
      setHasDarkClass(document.documentElement.classList.contains('dark'));
    };

    checkDarkClass();

    // 监听类名变化
    const observer = new MutationObserver(checkDarkClass);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
      observer.disconnect();
    };
  }, []);

  // 在服务端渲染期间，返回 false 避免 hydration 错误
  if (!mounted) {
    return false;
  }

  // 多重检测逻辑：只要有一个条件符合 dark，就认为是 dark 模式
  const isDark =
    resolvedTheme === 'dark' || // next-themes 解析后的主题
    theme === 'dark' || // 直接设置的主题
    hasDarkClass || // DOM 中的 dark 类
    (theme === 'system' && prefersDark); // 系统模式且用户偏好暗色

  return isDark;
}
