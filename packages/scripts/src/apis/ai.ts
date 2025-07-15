import Ajv from 'ajv';
import type { JSONSchemaType } from 'ajv';
import axios from 'axios';
import { warn, log } from '@/utils/logger';
import { env } from '@/config/env';
import type { Post } from '@yliu/types/blog';
import type {
  DifyPostSeoOutput,
  DifyColumnsOutput,
  DifySiteSeoOutput,
  ColumnOutput,
  SiteMetaOutput,
  PostSeoOutput,
  PostSeoInputItem,
  PostSeoResultItem,
} from '@yliu/types/ai';

import postsSeoSchema from '@/config/ai/posts-seo/posts-seo-schema.json';
import columnsSchema from '@/config/ai/columns/columns-schema.json';
import siteSeoSchema from '@/config/ai/site-seo/site-seo-schema.json';

const ajv = new Ajv();

const apiClient = axios.create({ timeout: 120000 }); // 2分钟超时

// 统一的 Dify 工作流调用函数，增加了 schema 校验
async function callDifyWorkflow<TInput, TOutput, TSchema>(
  url: string | undefined,
  apiKey: string | undefined,
  inputs: TInput,
  serviceName: string,
  schema: TSchema, // 接收 schema 作为参数
): Promise<TOutput | null> {
  if (!url || !apiKey) {
    // 这条日志现在由 transform-ai 插件处理，这里可以不再重复
    // warn(`🤖 ${serviceName} 服务未配置 (URL 或 API Key 缺失)，将跳过。`);
    return null;
  }

  log(`🚀 调用 ${serviceName} 服务...`);

  try {
    const response = await apiClient.post(
      url,
      {
        inputs,
        response_mode: 'blocking',
        user: 'blog-script-user',
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    // 假设 Dify 成功响应的结构
    const result = response.data?.data?.outputs?.result;

    if (!result) {
      warn(
        `🤖 ${serviceName} 服务响应格式不符合预期或无结果: ${JSON.stringify(response.data)}`,
      );
      return null;
    }

    // 使用 AJV 进行 schema 校验
    const validate = ajv.compile(schema as JSONSchemaType<TOutput>);
    if (validate(result)) {
      log(`✅ ${serviceName} 服务调用成功并通过格式校验。`);
      return result;
    } else {
      warn(`❌ ${serviceName} 响应格式校验失败:`);
      warn(ajv.errorsText(validate.errors));
      return null;
    }
  } catch (error: unknown) {
    let message = '未知错误';
    if (axios.isAxiosError(error)) {
      message = `状态码 ${error.response?.status}, 响应: ${JSON.stringify(error.response?.data)}`;
    } else if (error instanceof Error) {
      message = error.message;
    }
    warn(`❌ ${serviceName} 服务调用失败: ${message}`);
    return null;
  }
}

// 具体的 AI 服务函数，现在传入对应的 schema
export async function enhancePostsSEO(
  posts: Post[],
): Promise<PostSeoOutput[] | null> {
  const input: { articles: PostSeoInputItem[] } = {
    articles: posts.map((p) => ({
      id: p.id,
      title: p.title,
      content: p.content,
      labels: p.labels,
    })),
  };

  const result = await callDifyWorkflow<
    typeof input,
    DifyPostSeoOutput,
    typeof postsSeoSchema
  >(
    env.AI_POSTS_SEO_URL,
    env.AI_POSTS_SEO_API_KEY,
    input,
    '文章SEO优化',
    postsSeoSchema,
  );
  return result?.articles_seo || null;
}

export async function analyzeColumns(
  posts: Post[],
): Promise<ColumnOutput[] | null> {
  const articlesForColumns = posts.map((p) => ({ id: p.id, title: p.title }));
  const input = { articles: articlesForColumns };

  const result = await callDifyWorkflow<
    typeof input,
    DifyColumnsOutput,
    typeof columnsSchema
  >(
    env.AI_COLUMNS_URL,
    env.AI_COLUMNS_API_KEY,
    input,
    '专栏分析',
    columnsSchema,
  );
  return result?.columns || null;
}

export async function enhanceSiteSEO(
  postsSeo: PostSeoOutput[],
): Promise<SiteMetaOutput | null> {
  const input: { all_articles_seo: PostSeoResultItem[] } = {
    all_articles_seo: postsSeo.map((p) => ({
      id: p.id,
      optimized_title: p.optimized_title,
      description: p.description,
      keywords: p.keywords,
      tags: p.tags,
    })),
  };

  const result = await callDifyWorkflow<
    typeof input,
    DifySiteSeoOutput,
    typeof siteSeoSchema
  >(
    env.AI_SITE_SEO_URL,
    env.AI_SITE_SEO_API_KEY,
    input,
    '站点SEO汇总',
    siteSeoSchema,
  );
  return result?.site_meta || null;
}
