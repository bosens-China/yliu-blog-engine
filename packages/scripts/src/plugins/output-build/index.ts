import path from 'node:path';
import fse from 'fs-extra';
import type { Plugin } from '@/core/plugin';
import { log, error } from '@/utils/logger';
import type { BlogData } from '@yliu/types/blog';
import type { BuildContext } from '@/core/types';
import chalk from 'chalk';

export interface BuildOutputPluginConfig {
  fileName?: string;
}

interface OutputBuildPlugin extends Plugin {
  // 1. 修改 printSummary 的签名，让它接收 context
  printSummary(data: BlogData, context: BuildContext): void;
}

export function createBuildOutputPlugin(
  config: BuildOutputPluginConfig = {},
): OutputBuildPlugin {
  const { fileName = 'blog-data.json' } = config;

  return {
    name: 'plugin-output-build',

    async output(context: BuildContext) {
      log(`准备生成最终产物文件: ${fileName}`);
      const { posts, columns, labels, metadata, about } = context.data;

      if (!posts || !columns || !labels || !metadata) {
        error(
          '数据不完整，无法生成最终产物。请检查 transform-apply-data 插件的执行。缺少以下一个或多个字段: ' +
            ['posts', 'columns', 'labels', 'metadata']
              .filter((k) => !context.data[k as keyof typeof context.data])
              .join(', '),
        );
      }

      const finalBlogData: BlogData = {
        posts,
        columns,
        labels,
        metadata,
        about: about || null,
      };

      const outputPath = path.join(context.config.outputDir, fileName);

      try {
        await fse.ensureDir(path.dirname(outputPath));
        await fse.writeJson(outputPath, finalBlogData, { spaces: 2 });

        log(`✅ 最终产物成功写入: ${outputPath}`);
        // 2. 调用时，将 context 传进去
        this.printSummary(finalBlogData, context);
      } catch (e: unknown) {
        error(`写入最终产物文件 ${fileName} 失败`, e);
      }
    },

    // 3. 实现带有 context 参数的 printSummary
    printSummary(data: BlogData, context: BuildContext) {
      const stats = [
        { label: '📝 文章总数', value: data.posts.length },
        { label: '📚 专栏总数', value: data.columns.length },
        { label: '🏷️ 标签总数', value: data.labels.length },
        {
          label: '👤 作者头像',
          value: data.metadata.avatarUrl ? '✅ 已设置' : '❌ 未设置',
        },
        { label: '📄 关于页面', value: data.about ? '✅ 已添加' : '❌ 未添加' },
      ];

      console.log(chalk.green.bold('\n🎉 构建完成！最终数据统计:'));
      stats.forEach((stat) => {
        console.log(`   ${stat.label}: ${chalk.yellow(String(stat.value))}`);
      });

      // 4. 现在可以安全地访问 context 了
      const aiUsed =
        !!context.data.aiEnhancements &&
        context.data.aiEnhancements.postsSeo.length > 0;
      console.log(
        `   🤖 AI 增强: ${aiUsed ? chalk.cyan('已应用') : chalk.gray('未应用/使用兜底')}`,
      );
    },
  };
}
