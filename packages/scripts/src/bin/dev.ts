import path from 'node:path';
import { createRunner } from '@/core/runner';
import { error, log } from '@/utils/logger';
import type { BuildContext } from '@/core/types';
import { env, githubRepo } from '@/config/env';
import { CacheManager } from '@/core/cache';

// 复用生产环境的插件
import { createGithubResourcePlugin } from '@/plugins/resource-github';
import { createPostsTransformPlugin } from '@/plugins/transform-posts';

// 引入开发专用的输出插件
import { createDevOutputPlugin } from '@/plugins/output-dev';

async function main() {
  log('初始化构建上下文 (开发模式)...');

  const cache = await CacheManager.create();
  const context: BuildContext = {
    config: {
      isDev: true, // 标记为开发模式
      repo: githubRepo,
      outputDir: path.join(process.cwd(), 'src/data'),
      webAppDir: '',
    },
    dataSource: {},
    data: {},
    cache: cache,
  };

  log('配置插件流水线 (开发模式)...');
  const devPlugins = [
    // --- 1. Resource Phase (复用) ---
    // 同样需要获取 issues 数据
    createGithubResourcePlugin({ token: env.GITHUB_TOKEN }),

    // --- 2. Transform Phase (复用) ---
    // 同样需要将 issues 转换为 posts
    createPostsTransformPlugin(),

    // 在开发模式下，我们不需要图片处理、AI、数据应用等插件

    // --- 3. Output Phase (使用开发专用插件) ---
    createDevOutputPlugin({
      columnsTestFile: 'dev-for-columns-ai.json',
      batchTestFile: 'dev-for-seo-ai.json',
    }),
  ];

  const runner = createRunner(context, devPlugins);
  await runner.run();

  // 开发模式下通常不需要写入缓存，但保留亦可
  log('正在将缓存写入磁盘...');
  await context.cache.write();
  log('缓存已更新。');
}

main().catch((e) => {
  error('开发脚本发生顶层异常', e);
});
