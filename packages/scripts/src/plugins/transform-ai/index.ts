import type { Plugin } from '@/core/plugin';
import { log, warn } from '@/utils/logger';
import { processWithAgentBlog } from '@/apis/ai';
import { env } from '@/config/env';
import type { BuildContext } from '@/core/types';
import type {
  PostSeoOutput,
  ColumnOutput,
  SiteMetaOutput,
} from '@yliu/types/ai';

export interface AITransformPluginConfig {
  // 配置项可以保留，以便未来可以禁用特定部分的AI处理
  enablePostsSeo?: boolean;
  enableColumns?: boolean;
  enableSiteSeo?: boolean;
}

export function createAITransformPlugin(): Plugin {
// _config: AITransformPluginConfig = {},
  return {
    name: 'plugin-transform-ai',

    async transform(context: BuildContext) {
      // 检查是否有 OPENAI_API_KEY
      if (!env.OPENAI_API_KEY) {
        log('🤖 未提供 OPENAI_API_KEY，跳过 AI 增强处理');
        return;
      }

      if (!context.data.posts || context.data.posts.length === 0) {
        log('没有文章数据，跳过 AI 增强。');
        return;
      }

      log('🤖 开始 AI 增强处理 (通过 agent-blog 服务)...');

      // 调用新的 agent-blog 服务，它会一次性处理所有任务
      const agentResult = await processWithAgentBlog(context.data.posts);

      if (!agentResult) {
        warn('agent-blog 服务调用失败或返回空结果，AI 增强未应用。');
        return;
      }

      // --- 数据格式映射 ---
      // 将 agent-blog 的返回结果映射到项目现有的 AIEnhancements 结构中

      // 1. 映射文章SEO信息
      const postsSeo: PostSeoOutput[] = agentResult.articles.map((item) => ({
        id: item.id,
        optimized_title: item.title, // 新服务不优化标题，直接使用原标题
        description: item.excerpt, // excerpt -> description
        keywords: item.keywords,
        tags: [], // 新服务不返回 tags，提供空数组
      }));

      // 2. 映射专栏信息
      const columns: ColumnOutput[] = agentResult.columns.map((item) => ({
        name: item.name,
        description: item.description,
        article_ids: item.posts, // posts -> article_ids
      }));

      // 3. 映射站点SEO信息
      const siteMeta: SiteMetaOutput | null = agentResult.site_seo
        ? {
            title: agentResult.site_seo.title,
            description: agentResult.site_seo.description,
            keywords: agentResult.site_seo.keywords,
            tagline: '', // 新服务不返回 tagline，提供空字符串
          }
        : null;

      // 将映射后的数据存入上下文
      context.data.aiEnhancements = {
        postsSeo,
        columns,
        siteMeta,
      };

      log('🤖 AI 增强处理完成。');
    },
  };
}
