import path from 'node:path';
import fse from 'fs-extra';
import type { Plugin } from '@/core/plugin';
import { log, warn } from '@/utils/logger';
import type { Post } from '@yliu/types/blog';
import type { BuildContext } from '@/core/types';

export interface DevOutputPluginConfig {
  // 可以保留文件名配置，以备将来使用
  columnsTestFile?: string;
}

export function createDevOutputPlugin(
  config: DevOutputPluginConfig = {},
): Plugin {
  const { columnsTestFile = 'dev-articles-for-columns.json' } = config;

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

      // 现在只生成专栏测试文件
      await generateColumnsTestData(posts, columnsOutputPath);
    },
  };
}

async function generateColumnsTestData(posts: Post[], outputPath: string) {
  log(`  -> 正在生成专栏测试文件...`);
  const testData = posts.map((post) => ({ id: post.id, title: post.title }));
  await fse.writeJson(outputPath, testData, { spaces: 2 });
  log(`     ✅ 成功写入 ${testData.length} 篇文章到: ${outputPath}`);
}