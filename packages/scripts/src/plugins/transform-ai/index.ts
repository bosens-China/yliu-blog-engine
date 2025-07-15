import crypto from 'node:crypto';
import type { Plugin } from '@/core/plugin';
import type { Post } from '@yliu/types/blog';
import { log, warn } from '@/utils/logger';
import * as aiApi from '@/apis/ai';
import type { PostSeoOutput } from '@yliu/types/ai';
import { env } from '@/config/env';
import { BatchManager } from '@/utils/batch-manager';
import type { BuildContext } from '@/core/types';

export interface AITransformPluginConfig {
  enablePostsSeo?: boolean;
  enableColumns?: boolean;
  enableSiteSeo?: boolean;
}

export function createAITransformPlugin(
  config: AITransformPluginConfig,
): Plugin {
  const {
    enablePostsSeo = true,
    enableColumns = true,
    enableSiteSeo = true,
  } = config;

  return {
    name: 'plugin-transform-ai',

    async transform(context: BuildContext) {
      context.data.aiEnhancements = {
        postsSeo: [],
        columns: [],
        siteMeta: null,
      };

      if (!context.data.posts || context.data.posts.length === 0) {
        log('没有文章数据，跳过 AI 增强。');
        return;
      }
      log('🤖 开始 AI 增强处理...');

      if (enablePostsSeo && env.AI_POSTS_SEO_URL && env.AI_POSTS_SEO_API_KEY) {
        const aiPostsSeoCache = context.cache.get('aiPostsSeoCache') || {};
        const postsToProcess: Post[] = [];
        const cachedPostsSeo: PostSeoOutput[] = [];

        for (const post of context.data.posts) {
          const contentHash = crypto
            .createHash('sha256')
            .update(post.content)
            .digest('hex');
          const cacheKey = `${post.id}-${contentHash}`;
          const cachedResult = aiPostsSeoCache[cacheKey];
          if (cachedResult) {
            cachedPostsSeo.push(cachedResult);
          } else {
            postsToProcess.push(post);
          }
        }
        log(
          `AI 文章SEO: ${cachedPostsSeo.length} 篇命中缓存, ${postsToProcess.length} 篇需 AI 处理。`,
        );

        if (postsToProcess.length > 0) {
          const batchManager = new BatchManager();
          const batches = batchManager.createBatches(postsToProcess);
          const newPostsSeo: PostSeoOutput[] = [];
          for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            log(`  处理SEO批次 ${i + 1}/${batches.length}...`);
            const batchResults = await aiApi.enhancePostsSEO(batch.articles);
            if (batchResults) newPostsSeo.push(...batchResults);
          }
          log(`AI 服务成功处理了 ${newPostsSeo.length} 篇文章的 SEO。`);

          newPostsSeo.forEach((seoResult) => {
            const post = postsToProcess.find((p) => p.id === seoResult.id);
            if (post) {
              const contentHash = crypto
                .createHash('sha256')
                .update(post.content)
                .digest('hex');
              const cacheKey = `${post.id}-${contentHash}`;
              aiPostsSeoCache[cacheKey] = seoResult;
            }
          });
          context.cache.set('aiPostsSeoCache', aiPostsSeoCache);
          context.data.aiEnhancements.postsSeo = [
            ...cachedPostsSeo,
            ...newPostsSeo,
          ];
        } else {
          context.data.aiEnhancements.postsSeo = cachedPostsSeo;
        }
      } else {
        log('文章SEO AI功能已禁用或未配置，跳过。');
      }

      if (enableColumns && env.AI_COLUMNS_URL && env.AI_COLUMNS_API_KEY) {
        const columnsResult = await aiApi.analyzeColumns(context.data.posts);
        if (columnsResult) {
          log(`AI 服务成功分析出 ${columnsResult.length} 个专栏。`);
          context.data.aiEnhancements.columns = columnsResult;
        }
      } else {
        log('专栏分析 AI功能已禁用或未配置，跳过。');
      }

      if (enableSiteSeo && env.AI_SITE_SEO_URL && env.AI_SITE_SEO_API_KEY) {
        if (context.data.aiEnhancements.postsSeo.length > 0) {
          const siteMetaResult = await aiApi.enhanceSiteSEO(
            context.data.aiEnhancements.postsSeo,
          );
          if (siteMetaResult) {
            log('AI 服务成功生成了站点 SEO 元数据。');
            context.data.aiEnhancements.siteMeta = siteMetaResult;
          }
        } else {
          warn('站点SEO AI功能已启用，但没有文章SEO数据作为输入，跳过。');
        }
      } else {
        log('站点SEO AI功能已禁用或未配置，跳过。');
      }

      log('🤖 AI 增强处理完成。');
    },
  };
}
