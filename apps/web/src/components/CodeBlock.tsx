'use client';

import React, { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';

interface CodeBlockProps {
  language: string;
  children: React.ReactNode;
  codeText: string;
  className?: string;
}

export default function CodeBlock({
  language,
  children,
  codeText,
  className,
}: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="code-block-container relative rounded-lg overflow-hidden my-6 md:my-8 border border-border/20">
      {/* Mac 风格顶部栏 */}
      <div
        className={clsx(
          'code-block-header flex items-center justify-between h-11 px-4',
          'bg-secondary/50 border-b border-border/20',
        )}
      >
        <div className="flex items-center gap-3">
          {/* Mac 风格三个小圆点 */}
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] shadow-sm"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] shadow-sm"></div>
            <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] shadow-sm"></div>
          </div>

          {/* 语言标签 */}
          {language && (
            <div
              className={clsx(
                'text-xs px-2.5 py-1 rounded-md font-medium',
                'bg-muted text-muted-foreground border border-border/30',
              )}
            >
              {language.toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* 折叠按钮 */}
          <button
            type="button"
            className={clsx(
              'text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors duration-200',
              'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
            onClick={toggleCollapse}
            aria-label={isCollapsed ? '展开代码' : '折叠代码'}
          >
            <span className="font-medium">{isCollapsed ? '展开' : '折叠'}</span>
            {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>

          {/* 复制按钮 */}
          <button
            type="button"
            className={clsx(
              'text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors duration-200',
              'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
            onClick={copyToClipboard}
            aria-label="复制代码"
          >
            {isCopied ? (
              <>
                <span className="text-green-500 font-medium">已复制!</span>
                <Check size={14} className="text-green-500" />
              </>
            ) : (
              <>
                <span className="font-medium">复制</span>
                <Copy size={14} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* 代码内容 */}
      <div
        className={clsx(
          'transition-all duration-300 ease-in-out',
          isCollapsed ? 'max-h-0' : 'max-h-none',
        )}
      >
        <pre
          className={clsx(
            'my-0! rounded-t-none pt-4 pb-4 px-4 md:px-5 overflow-auto max-h-[500px] text-sm leading-relaxed',
            'bg-card text-card-foreground', // 使用主题变量
          )}
        >
          <code className={clsx('hljs', className)}>{children}</code>
        </pre>
      </div>
    </div>
  );
}
