import { z } from 'zod';
import 'dotenv/config.js';
import { error } from '@/utils/logger';

const envSchema = z.object({
  // --- 基础配置 ---
  NEXT_PUBLIC_GITHUB_REPOSITORY: z.string().min(1, 'Github 仓库地址是必需的'),
  GITHUB_TOKEN: z
    .string()
    .optional()
    .describe('GitHub 访问令牌（推荐，避免 API 限流）'),

  // --- 站点信息定制 ---
  NEXT_PUBLIC_BLOG_TITLE: z.string().optional().describe('博客标题'),
  NEXT_PUBLIC_BLOG_AUTHOR: z
    .string()
    .optional()
    .describe('作者名称 (默认: 仓库所有者)'),
  NEXT_PUBLIC_FOOTER_TEXT: z.string().optional().describe('页脚文本'),

  // --- 路由与 URL ---
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .optional()
    .refine((val) => !val || /^https?:\/\/.+/.test(val), {
      message: 'NEXT_PUBLIC_SITE_URL 必须是一个有效的 URL',
    })
    .transform((val) => val || undefined)
    .describe('站点 URL (例如 `https://blog.example.com`)'),
  NEXT_PUBLIC_BASE_PATH: z
    .string()
    .optional()
    .describe('站点基础路径 (例如 /blog)'),

  // --- 高级定制 ---
  NEXT_PUBLIC_HEADER_CONFIG: z
    .string()
    .optional()
    .describe('Header 菜单配置 (JSON 字符串)'),
  COLUMN_DELIMITERS: z
    .string()
    .optional()
    .default('之,系列,-,（,(,）,)#')
    .describe('用于识别专栏的标题分隔符（逗号分隔）'),
  COLUMN_MIN_ARTICLES: z.coerce
    .number()
    .optional()
    .default(2)
    .describe('一个专栏至少需要包含的文章数量（设置为 0 禁用）'),
  COLUMN_MIN_PREFIX_LENGTH: z.coerce
    .number()
    .optional()
    .default(6)
    .describe('自动识别专栏所需的最短公共前缀长度'),

  // --- SEO 兜底配置 ---
  NEXT_PUBLIC_SEO_DESCRIPTION: z
    .string()
    .optional()
    .describe('用于 SEO 的站点描述 (无 AI 时使用)'),
  NEXT_PUBLIC_SEO_KEYWORDS: z
    .string()
    .optional()
    .describe('用于 SEO 的站点关键词，用逗号分隔 (无 AI 时使用)'),

  // --- AI 服务配置 ---
  AI_ENABLED: z.coerce.boolean().default(false),
});

// 创建一个 process.env 的可写副本
const processedEnv = { ...process.env };

// 定义一个白名单，其中的键即使用户输入为空字符串，也应被视为空字符串，而不是回退到默认值
const allowEmptyString = new Set<string>([
  /* 例如: 'NEXT_PUBLIC_FOOTER_TEXT' */
]);

// 遍历环境变量，如果值为空字符串且不在白名单中，则将其删除
// 这样 Zod 在解析时会因为找不到该键而自动应用 schema 中定义的默认值
for (const key in processedEnv) {
  if (processedEnv[key] === '' && !allowEmptyString.has(key)) {
    delete processedEnv[key];
  }
}

const parsedEnv = envSchema.safeParse(processedEnv);

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
