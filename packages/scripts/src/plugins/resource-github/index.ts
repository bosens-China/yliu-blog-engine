import type { Plugin } from '@/core/plugin';
import { fetchGitHubIssues, fetchRepoDetails } from '@/apis/github';
import { log, warn } from '@/utils/logger';
import type { BuildContext } from '@/core/types';

export interface GithubResourcePluginConfig {
  token?: string;
}

export function createGithubResourcePlugin(
  config: GithubResourcePluginConfig,
): Plugin {
  return {
    name: 'plugin-resource-github',

    async resource(context: BuildContext) {
      const { owner, name } = context.config.repo;

      log(`正在从 GitHub [${owner}/${name}] 获取数据...`);

      const [issuesResult, repoDetailsResult] = await Promise.allSettled([
        fetchGitHubIssues(owner, name, config.token),
        fetchRepoDetails(owner, name, config.token),
      ]);

      // 初始化 dataSource.github 结构
      context.dataSource.github = { issues: [], repoDetails: null };

      if (issuesResult.status === 'fulfilled') {
        context.dataSource.github.issues = issuesResult.value;
        log(`成功获取 ${issuesResult.value.length} 个 issues。`);
      } else {
        warn(`获取 issues 失败: ${issuesResult.reason.message}。`);
      }

      if (repoDetailsResult.status === 'fulfilled') {
        context.dataSource.github.repoDetails = repoDetailsResult.value;
        log('成功获取仓库详情。');
      } else {
        warn(
          `获取仓库详情失败: ${repoDetailsResult.reason.message}。部分元数据可能缺失。`,
        );
      }
    },
  };
}
