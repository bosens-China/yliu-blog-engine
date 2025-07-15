import path from 'node:path';
import type { Plugin } from '@/core/plugin';
import { log, warn } from '@/utils/logger';
import { ImageProcessor } from './image-processor';
import type { BuildContext } from '@/core/types';

export interface ImagesTransformPluginConfig {
  siteUrl: string;
}

export function createImagesTransformPlugin(
  config: ImagesTransformPluginConfig,
): Plugin {
  return {
    name: 'plugin-transform-images',

    async transform(context: BuildContext) {
      if (!context.data.posts || context.data.posts.length === 0) {
        log('没有文章数据，跳过图片处理。');
        return;
      }

      if (!config.siteUrl) {
        warn('未提供 siteUrl 配置，图片防盗链探测可能不准确。');
      }

      const webAppDir = context.config.webAppDir;
      if (!webAppDir) {
        warn(
          '在 context.config 中未找到 webAppDir，无法确定图片输出目录，跳过图片处理。',
        );
        return;
      }

      // 由插件根据 context 配置来决定最终的物理路径
      const publicDir = path.join(webAppDir, 'public/images/downloaded');

      const processor = new ImageProcessor(
        context.cache,
        config.siteUrl,
        publicDir,
      );

      const processedPosts = await processor.process(context.data.posts);
      context.data.posts = processedPosts;
    },
  };
}
