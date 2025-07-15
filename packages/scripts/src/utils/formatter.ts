import readingTime from 'reading-time';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import stripMarkdown from 'strip-markdown';
import { visit } from 'unist-util-visit';
import type { Image } from 'mdast';
import remarkStringify from 'remark-stringify';

/**
 * 计算内容的预估阅读时间。
 * @param text 需要计算的文本。
 * @returns 预估的分钟数。
 */
export function calculateReadingTime(text: string): number {
  if (!text) return 0;
  return Math.ceil(readingTime(text).minutes);
}

/**
 * 从 Markdown 内容中生成纯文本摘要。
 * @param content 文章的完整 Markdown 内容。
 * @param length 摘要的最大长度，默认为 150。
 * @returns 纯文本摘要。
 */
export function generateExcerpt(content: string, length = 150): string {
  if (!content) return '';

  const plainText = unified()
    .use(remarkParse)
    .use(stripMarkdown)
    .use(remarkStringify) // 2. 在 .processSync() 之前添加编译器
    .processSync(content)
    .toString();

  const trimmedText = plainText.trim().replace(/\s+/g, ' ');
  if (trimmedText.length <= length) {
    return trimmedText;
  }
  return trimmedText.slice(0, length) + '...';
}

/**
 * 从 Markdown 内容中提取最多三张图片作为缩略图。
 * @param content Markdown 文本。
 * @returns 图片 URL 数组。
 */
export function extractThumbnails(content: string): string[] {
  if (!content) return [];

  const imageUrls: string[] = [];
  const tree = unified().use(remarkParse).parse(content);

  visit(tree, 'image', (node: Image) => {
    if (node.url && imageUrls.length < 3) {
      imageUrls.push(node.url);
    }
  });

  return imageUrls;
}
