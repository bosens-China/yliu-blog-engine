import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

/**
 * 简化的 dark 模式检测 hook
 * 优先考虑用户的明确选择，只在 system 模式下检测系统偏好
 */
export function useDarkMode() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);

  useEffect(() => {
    setMounted(true);

    // 检测系统暗色模式偏好
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemPrefersDark(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleMediaChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, []);

  // 在服务端渲染期间，返回 false 避免 hydration 错误
  if (!mounted) {
    return false;
  }

  // 简化的逻辑：用户选择优先
  if (theme === 'light') {
    return false; // 用户明确选择 light，不管系统如何
  }

  if (theme === 'dark') {
    return true; // 用户明确选择 dark，不管系统如何
  }

  // 只有在 system 模式下才检测系统偏好
  if (theme === 'system') {
    // 优先使用 resolvedTheme（next-themes 的计算结果）
    if (resolvedTheme) {
      return resolvedTheme === 'dark';
    }
    // 降级到系统检测
    return systemPrefersDark;
  }

  // 默认返回 false
  return false;
}
