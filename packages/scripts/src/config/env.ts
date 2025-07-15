import { z } from 'zod';
import 'dotenv/config.js';
import { error } from '@/utils/logger';

const envSchema = z.object({
  NEXT_PUBLIC_GITHUB_REPOSITORY: z.string().min(1, 'Github 仓库地址是必需的'),

  // 使用 z.string().url() 并通过 .optional() 标记为可选
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url({ message: 'NEXT_PUBLIC_SITE_URL 必须是一个有效的 URL' })
    .optional(),

  // 新增，用于元数据兜底
  NEXT_PUBLIC_BLOG_TITLE: z.string().optional(),
  NEXT_PUBLIC_SEO_DESCRIPTION: z.string().optional(),
  NEXT_PUBLIC_SEO_KEYWORDS: z.string().optional(),

  GITHUB_TOKEN: z.string().optional(),

  // 所有 URL 验证都使用新的 API
  AI_POSTS_SEO_API_KEY: z.string().optional(),
  AI_POSTS_SEO_URL: z
    .string()
    .url({ message: 'AI_POSTS_SEO_URL 必须是一个有效的 URL' })
    .optional(),

  AI_COLUMNS_API_KEY: z.string().optional(),
  AI_COLUMNS_URL: z
    .string()
    .url({ message: 'AI_COLUMNS_URL 必须是一个有效的 URL' })
    .optional(),

  AI_SITE_SEO_API_KEY: z.string().optional(),
  AI_SITE_SEO_URL: z
    .string()
    .url({ message: 'AI_SITE_SEO_URL 必须是一个有效的 URL' })
    .optional(),
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
