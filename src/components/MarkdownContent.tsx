"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import { Copy, Check, ExternalLink } from "lucide-react";
import type { Components } from "react-markdown";

interface MarkdownContentProps {
  content: string;
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // 代码复制功能
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCode(text);
      setTimeout(() => {
        setCopiedCode(null);
      }, 2000);
    });
  };

  const components: Components = {
    p: ({ node, children, ...props }) => {
      // 检查 p 标签内是否只有一个 img 子元素
      if (
        node &&
        "children" in node &&
        Array.isArray(node.children) &&
        node.children.length === 1
      ) {
        const child = node.children[0];
        if (
          child &&
          typeof child === "object" &&
          "type" in child &&
          child.type === "element" &&
          "tagName" in child &&
          child.tagName === "img"
        ) {
          return <>{children}</>;
        }
      }

      // 否则返回正常的段落
      return <p {...props}>{children}</p>;
    },
    img: ({ src, alt }) => (
      <figure className="my-6 md:my-8">
        <div className="rounded-lg overflow-hidden shadow-sm dark:shadow-none border border-border">
          <Image
            src={(src as string) || ""}
            alt={alt || ""}
            width={800}
            height={400}
            className="w-full h-auto dark:brightness-90 transition-all"
            style={{ maxHeight: "400px", objectFit: "contain" }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
            loading="lazy"
          />
        </div>
        {alt && alt !== "image.png" && (
          <figcaption className="text-center text-sm text-muted-foreground mt-2">
            {alt}
          </figcaption>
        )}
      </figure>
    ),
    ul: ({ children }) => (
      <ul className="list-disc pl-6 my-4 space-y-2">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal pl-6 my-4 space-y-2">{children}</ol>
    ),
    li: ({ children }) => <li className="ml-2">{children}</li>,
    code: ({ className, children, ...props }) => {
      // 检查是否在pre标签内（代码块）
      const match = /language-(\w+)/.exec(className || "");
      const language = match ? match[1] : "";
      const codeText = String(children);
      const isCopied = copiedCode === codeText;

      if (!match) {
        // 内联代码
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }

      // 代码块
      return (
        <div className="code-block-container relative rounded-lg overflow-hidden my-6 md:my-8">
          <div className="code-block-header flex items-center justify-between h-9 px-4 bg-[#0e1117] dark:bg-[#0e1117] text-muted-foreground">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]"></div>
            </div>
            <div className="flex items-center gap-2">
              {language && (
                <div className="text-xs px-2 py-0.5 rounded bg-[#252525] dark:bg-[#252525] uppercase">
                  {language}
                </div>
              )}
              <button
                type="button"
                className="text-xs flex items-center gap-1 p-1 hover:text-foreground transition-colors"
                onClick={() => copyToClipboard(codeText)}
                aria-label="复制代码"
              >
                {isCopied ? (
                  <>
                    <span className="text-green-500">已复制!</span>
                    <Check size={14} className="text-green-500" />
                  </>
                ) : (
                  <>
                    <span>复制</span>
                    <Copy size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
          <pre className="mt-0 rounded-t-none pt-0 bg-[#0e1117] dark:bg-[#0e1117] pb-0 px-4 md:px-5 overflow-auto max-h-[500px] text-sm md:text-base">
            <code className={className} {...props}>
              {children}
            </code>
          </pre>
        </div>
      );
    },
    a: ({ href, children }) => {
      const isExternal = href?.startsWith("http");
      return (
        <a
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="text-primary hover:text-primary/80 transition-colors underline underline-offset-2 inline-flex items-center gap-1"
        >
          {children}
          {isExternal && <ExternalLink size={14} className="inline-block" />}
        </a>
      );
    },
    table: ({ children }) => (
      <div className="overflow-x-auto my-6 md:my-8 border border-border rounded-lg">
        <table className="w-full border-collapse">{children}</table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border-b border-border bg-muted/50 px-4 py-2 text-left font-medium">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border-b border-border px-4 py-2">{children}</td>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="my-8 border-border" />,
    h1: ({ children }) => (
      <h1 className="text-3xl md:text-4xl font-bold mt-12 mb-4 scroll-mt-20">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-4 scroll-mt-20 border-b border-border pb-1">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl md:text-2xl font-bold mt-8 mb-4 scroll-mt-20">
        {children}
      </h3>
    ),
  };

  return (
    <div className="prose dark:prose-invert prose-headings:scroll-mt-20 prose-pre:p-0 prose-pre:bg-transparent prose-pre:overflow-x-auto max-w-none">
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

      <style jsx global>{`
        .prose {
          font-size: 1.05rem;
        }

        .prose code {
          background-color: rgba(0, 0, 0, 0.05);
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-size: 0.875em;
        }

        .dark .prose code {
          background-color: rgba(255, 255, 255, 0.1);
        }

        .prose img {
          border-radius: 0.5rem;
        }

        /* 列表样式 */
        .prose ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 1rem 0;
        }

        .prose ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin: 1rem 0;
        }

        .prose li {
          margin-bottom: 0.5rem;
        }

        .prose li > ul,
        .prose li > ol {
          margin: 0.5rem 0;
        }

        .prose li::marker {
          color: var(--foreground);
          opacity: 0.7;
        }

        .dark .prose li::marker {
          color: var(--foreground);
          opacity: 0.7;
        }

        @media (max-width: 640px) {
          .prose {
            font-size: 1rem;
          }

          .prose pre {
            font-size: 0.875rem;
          }

          .prose h1 {
            font-size: 1.75rem;
          }

          .prose h2 {
            font-size: 1.5rem;
          }

          .prose h3 {
            font-size: 1.25rem;
          }

          .prose ul,
          .prose ol {
            padding-left: 1.25rem;
          }
        }

        @media print {
          .prose pre {
            white-space: pre-wrap;
            word-break: break-all;
          }

          .code-block-header {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
