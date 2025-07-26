'use client';

import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import type { Components } from 'react-markdown';
import CodeBlock from './CodeBlock';
import '../styles/markdown.css';
import { useTheme } from 'next-themes';

interface MarkdownContentProps {
  content: string;
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  const { theme } = useTheme();

  const [styleContent, setStyleContent] = useState('');

  useEffect(() => {
    const fn = async () => {
      fetch(
        theme === 'dark'
          ? `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/styles/github-dark.min.css`
          : `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/styles/github.min.css`,
      )
        .then((res) => res.text())
        .then((text) => {
          setStyleContent(text);
        });
    };
    fn();
  }, [theme]);

  // 生成锚点 ID 的工具函数
  const generateId = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // 创建一个通用函数来渲染带锚点的标题
  const createHeading = (level: 1 | 2 | 3) => {
    const Tag: `h${typeof level}` = `h${level}`;
    return function Heading({ children }: { children?: React.ReactNode }) {
      const text = children?.toString() || '';
      const id = generateId(text);

      const handleClick = () => {
        window.history.pushState(null, '', `#${id}`);
      };

      return (
        <Tag
          id={id}
          className="scroll-mt-20 cursor-pointer hover:opacity-80 transition-opacity group"
          onClick={handleClick}
        >
          {children}
          <span className="ml-2 opacity-0 group-hover:opacity-50 text-sm">
            🔗
          </span>
        </Tag>
      );
    };
  };

  const components: Components = {
    // 使用通用函数创建 h1-h3
    h1: createHeading(1),
    h2: createHeading(2),
    h3: createHeading(3),

    // 自定义图片渲染，添加 figcaption
    img: ({ src, alt }) => (
      <figure className="my-6 md:my-8">
        <div className="rounded-lg overflow-hidden shadow-sm dark:shadow-none border border-border">
          <Image
            src={(src as string) || ''}
            alt={alt || ''}
            width={800}
            height={400}
            className="w-full h-auto dark:brightness-90 transition-all"
            style={{ maxHeight: '400px', objectFit: 'contain' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
            loading="lazy"
          />
        </div>
        {alt && alt !== 'image.png' && (
          <figcaption className="text-center text-sm text-muted-foreground mt-2">
            {alt}
          </figcaption>
        )}
      </figure>
    ),

    // 自定义代码块渲染
    code: ({ className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const codeText = String(children);

      // 内联代码，prose 会处理其样式
      if (!match) {
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }

      // 使用自定义的 CodeBlock 组件渲染代码块
      return (
        <CodeBlock
          language={language}
          codeText={codeText}
          className={className}
        >
          {children}
        </CodeBlock>
      );
    },

    // 自定义链接渲染，处理外部链接
    a: ({ href, children }) => {
      const isExternal = href && !href.startsWith('#') && !href.startsWith('/');

      if (isExternal) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            {children}
            <ExternalLink size={14} className="flex-shrink-0" />
          </a>
        );
      }

      return (
        <a href={href} className="text-primary hover:underline">
          {children}
        </a>
      );
    },
  };

  return (
    <>
      <div className="prose dark:prose-invert prose-headings:scroll-mt-20 prose-pre:p-0 prose-pre:bg-transparent prose-pre:overflow-x-auto max-w-none markdown-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[
            rehypeRaw,
            [rehypeHighlight, { detect: true, ignoreMissing: true }],
          ]}
          components={components}
        >
          {content}
        </ReactMarkdown>
      </div>
      <style>{styleContent}</style>
    </>
  );
}
