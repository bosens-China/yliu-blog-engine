import axios from 'axios';
import { warn, log } from '@/utils/logger';
import { env } from '@/config/env';
import type { Post } from '@yliu/types/blog';
import type { AgentBlogOutput } from '@yliu/types/ai';

const apiClient = axios.create({});

/**
 * 调用本地的 agent-blog FastAPI 服务来处理所有 AI 任务。
 * @param posts 需要处理的文章列表
 * @returns 包含所有 AI 增强数据的对象，或在失败时返回 null
 */
export async function processWithAgentBlog(
  posts: Post[],
): Promise<AgentBlogOutput | null> {
    // 检查 AI 是否启用
  if (!env.AI_ENABLED) {
    warn('🤖 AI 功能未启用，跳过 AI 增强处理');
    return null;
  }

  // CI 环境中固定使用本地服务地址
  const url = 'http://localhost:8000/process';
  log('🚀 调用 agent-blog 服务...');

  // FastAPI 需要的输入格式是 Post 对象的数组
  const payload = posts.map((p) => ({
    id: p.id,
    title: p.title,
    content: p.content,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));

  try {
    const response = await apiClient.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 假设 FastAPI 成功响应的结构为 { message: string, data: AgentBlogOutput }
    const result = response.data?.data;

    if (result && result.articles && result.columns && result.site_seo) {
      log('✅ agent-blog 服务调用成功。');
      return result;
    } else {
      warn(
        `🤖 agent-blog 服务响应格式不符合预期: ${JSON.stringify(response.data)}`,
      );
      return null;
    }
  } catch (error: unknown) {
    let message = '未知错误';
    if (axios.isAxiosError(error)) {
      message = `状态码 ${error.response?.status}, 响应: ${JSON.stringify(error.response?.data)}`;
    } else if (error instanceof Error) {
      message = error.message;
    }
    warn(`❌ agent-blog 服务调用失败: ${message}`);
    return null;
  }
}
