import path from 'node:path';
import fse from 'fs-extra';
import type { Plugin } from '@/core/plugin';
import { log, warn } from '@/utils/logger';
import { BatchManager } from '@/utils/batch-manager';
import type { Post } from '@yliu/types/blog';
import type { BuildContext } from '@/core/types';

export interface DevOutputPluginConfig {
  columnsTestFile?: string;
  batchTestFile?: string;
}

export function createDevOutputPlugin(
  config: DevOutputPluginConfig = {},
): Plugin {
  const {
    columnsTestFile = 'dev-articles-for-columns.json',
    batchTestFile = 'dev-articles-batched-for-seo.json',
  } = config;

  return {
    name: 'plugin-output-dev',

    async output(context: BuildContext) {
      log('DEV MODE: 准备生成开发和测试用的数据文件...');

      const { posts } = context.data;
      if (!posts || posts.length === 0) {
        warn('没有文章数据，无法生成开发文件。');
        return;
      }

      await fse.ensureDir(context.config.outputDir);
      const columnsOutputPath = path.join(
        context.config.outputDir,
        columnsTestFile,
      );
      const batchOutputPath = path.join(
        context.config.outputDir,
        batchTestFile,
      );

      // 这两个方法是普通的函数，不是插件对象的方法，所以不能用 this 调用
      await generateColumnsTestData(posts, columnsOutputPath);
      await generateBatchTestData(posts, batchOutputPath);
    },
  };
}

async function generateColumnsTestData(posts: Post[], outputPath: string) {
  log(`  -> 正在生成专栏测试文件...`);
  const testData = posts.map((post) => ({ id: post.id, title: post.title }));
  await fse.writeJson(outputPath, testData, { spaces: 2 });
  log(`     ✅ 成功写入 ${testData.length} 篇文章到: ${outputPath}`);
}

async function generateBatchTestData(posts: Post[], outputPath: string) {
  log(`  -> 正在生成批处理测试文件...`);
  const batchManager = new BatchManager();
  const batches = batchManager.createBatches(posts);
  const batchedArticlesForTest = batches.map((batch) =>
    batch.articles.map((post) => ({
      id: post.id,
      title: post.title,
      character_count: post.content.length,
      is_truncated: post.content.includes(
        '[注：文章内容已截取，以上为主要部分]',
      ),
      content_preview: post.content.slice(0, 100) + '...',
    })),
  );
  await fse.writeJson(outputPath, batchedArticlesForTest, { spaces: 2 });
  log(
    `     ✅ 成功写入 ${batchedArticlesForTest.length} 个批次到: ${outputPath}`,
  );
}
