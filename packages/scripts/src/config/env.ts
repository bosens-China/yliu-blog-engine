import { z } from 'zod';
import 'dotenv/config.js';
import { error } from '@/utils/logger';

const envSchema = z.object({
  // --- 基础配置 ---
  NEXT_PUBLIC_GITHUB_REPOSITORY: z.string().min(1, 'Github 仓库地址是必需的'),
  GITHUB_TOKEN: z.string().optional().describe('GitHub 访问令牌（推荐，避免 API 限流）'),

  // --- 站点信息定制 ---
  NEXT_PUBLIC_BLOG_TITLE: z.string().optional().describe('博客标题'),
  NEXT_PUBLIC_BLOG_AUTHOR: z.string().optional().describe('作者名称 (默认: 仓库所有者)'),
  NEXT_PUBLIC_FOOTER_TEXT: z.string().optional().describe('页脚文本'),

  // --- 路由与 URL ---
  NEXT_PUBLIC_SITE_URL: z
    .url({ message: 'NEXT_PUBLIC_SITE_URL 必须是一个有效的 URL' })
    .optional()
    .describe('站点 URL (例如 `https://blog.example.com`)'),
  NEXT_PUBLIC_BASE_PATH: z.string().optional().describe('站点基础路径 (例如 /blog)'),

  // --- 高级定制 ---
  NEXT_PUBLIC_HEADER_CONFIG: z.string().optional().describe('Header 菜单配置 (JSON 字符串)'),
  COLUMN_DELIMITERS: z
    .string()
    .optional()
    .default('之,系列,-,（,(,）,)#')
    .describe('用于识别专栏的标题分隔符（逗号分隔）'),
  COLUMN_MIN_ARTICLES: z.coerce
    .number()
    .optional()
    .default(2)
    .describe('一个专栏至少需要包含的文章数量'),
  COLUMN_MIN_PREFIX_LENGTH: z.coerce
    .number()
    .optional()
    .default(6)
    .describe('自动识别专栏所需的最短公共前缀长度'),

  // --- SEO 兜底配置 ---
  NEXT_PUBLIC_SEO_DESCRIPTION: z.string().optional().describe('用于 SEO 的站点描述 (无 AI 时使用)'),
  NEXT_PUBLIC_SEO_KEYWORDS: z.string().optional().describe('用于 SEO 的站点关键词，用逗号分隔 (无 AI 时使用)'),

  // --- AI 服务配置 (Dify, etc.) ---
  AI_USER_ID: z.string().optional().describe('调用 AI 服务的用户标识符 (默认: github.actor)'),

  AI_POSTS_SEO_API_KEY: z.string().optional().describe('文章 SEO 优化的 AI 服务 API Key'),
  AI_POSTS_SEO_URL: z
    .url({ message: 'AI_POSTS_SEO_URL 必须是一个有效的 URL' })
    .optional()
    .describe('文章 SEO 优化的 AI 服务 URL'),

  AI_COLUMNS_API_KEY: z.string().optional().describe('专栏分析的 AI 服务 API Key'),
  AI_COLUMNS_URL: z
    .url({ message: 'AI_COLUMNS_URL 必须是一个有效的 URL' })
    .optional()
    .describe('专栏分析的 AI 服务 URL'),

  AI_SITE_SEO_API_KEY: z.string().optional().describe('站点 SEO 汇总的 AI 服务 API Key'),
  AI_SITE_SEO_URL: z
    .url({ message: 'AI_SITE_SEO_URL 必须是一个有效的 URL' })
    .optional()
    .describe('站点 SEO 汇总的 AI 服务 URL'),

  // --- AI 批处理配置 ---
  AI_MAX_CHARS_PER_BATCH: z.coerce
    .number()
    .optional()
    .default(50000)
    .describe('AI 处理时，每个批次的最大字符数'),
  AI_SINGLE_ARTICLE_THRESHOLD: z.coerce
    .number()
    .optional()
    .default(40000)
    .describe('单篇文章大小超过此阈值将独立处理'),
  AI_MAX_ARTICLES_PER_BATCH: z.coerce
    .number()
    .optional()
    .default(15)
    .describe('AI 处理时，每个批次的最大文章数量'),
  AI_ARTICLE_TRUNCATE_LENGTH: z.coerce
    .number()
    .optional()
    .default(45000)
    .describe('为避免超长，输入给 AI 的文章内容将被截断到此长度'),
  AI_TRUNCATE_SUFFIX: z
    .string()
    .optional()
    .default('\n\n[注：文章内容已截取，以上为主要部分]')
    .describe('文章被截断时添加的后缀'),
  AI_ENABLE_PROCESSING: z.coerce
    .boolean()
    .optional()
    .default(true)
    .describe('是否启用 AI 处理'),
  AI_MAX_CONCURRENT_REQUESTS: z.coerce
    .number()
    .optional()
    .default(3)
    .describe('AI 请求的最高并发数'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const issues = parsedEnv.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  error(`环境变量验证失败，请检查 .env 文件:\n${issues}`);
}

export const env = parsedEnv.data;

export const githubRepo = (() => {
  const repoPath = env.NEXT_PUBLIC_GITHUB_REPOSITORY;
  const [owner, name] = repoPath.split('/');
  if (!owner || !name) {
    error(
      `环境变量 NEXT_PUBLIC_GITHUB_REPOSITORY 格式不正确，应为 "owner/name"，当前值为 "${repoPath}"`,
    );
  }
  return { owner, name };
})();
