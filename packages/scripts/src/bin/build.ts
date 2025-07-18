import path from 'node:path';
import { createRunner } from '@/core/runner';
import { error, log } from '@/utils/logger';
import type { BuildContext } from '@/core/types';
import { env, githubRepo } from '@/config/env';
import { CacheManager } from '@/core/cache';

import { createGithubResourcePlugin } from '@/plugins/resource-github';
import { createPostsTransformPlugin } from '@/plugins/transform-posts';
import { createImagesTransformPlugin } from '@/plugins/transform-images';
import { createAITransformPlugin } from '@/plugins/transform-ai';
import { createApplyDataTransformPlugin } from '@/plugins/transform-apply-data';
import { createBuildOutputPlugin } from '@/plugins/output-build';

async function main() {
  log('初始化构建上下文...');

  const cache = await CacheManager.create();

  const context: BuildContext = {
    config: {
      isDev: false,
      repo: githubRepo,
      // 数据文件的输出目录，指向 web 应用的 src/data
      outputDir: path.resolve(process.cwd(), '../../apps/web/src/data'),
      // web 应用的根目录，用于定位 public 文件夹
      webAppDir: path.resolve(process.cwd(), '../../apps/web'),
    },
    cache: cache,
    dataSource: {},
    data: {},
  };

  log('配置插件流水线...');
  const buildPlugins = [
    createGithubResourcePlugin({ token: env.GITHUB_TOKEN }),
    // 1. 首先处理图片，确保所有外部链接都被替换为本地链接
    createImagesTransformPlugin({
      siteUrl:
        env.NEXT_PUBLIC_SITE_URL || `https://${githubRepo.owner}.github.io`,
    }),
    // 2. 然后再进行文章转换，此时可以从干净的内容中提取正确的缩略图
    createPostsTransformPlugin(),
    // 3. 接着进行 AI 增强
    createAITransformPlugin({
      enablePostsSeo: true,
      enableColumns: true,
      enableSiteSeo: true,
    }),
    // 4. 应用所有转换结果
    createApplyDataTransformPlugin(),
    // 5. 最后输出构建产物
    createBuildOutputPlugin({
      fileName: 'blog-data.json',
    }),
  ];

  const runner = createRunner(context, buildPlugins);
  await runner.run();

  log('正在将缓存写入磁盘...');
  await context.cache.write();
  log('缓存已更新。');
}

main().catch((e) => {
  error('构建脚本发生顶层异常', e);
});
