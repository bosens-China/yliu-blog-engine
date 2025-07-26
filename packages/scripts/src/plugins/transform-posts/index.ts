import type { Plugin } from '@/core/plugin';
import type { GithubIssue } from '@yliu/types/issues';
import type { Post } from '@yliu/types/blog';
import { log } from '@/utils/logger';
import {
  calculateReadingTime,
  generateExcerpt,
  extractThumbnails,
} from '@/utils/formatter';
import type { BuildContext } from '@/core/types';

function issueToPost(issue: GithubIssue): Post {
  const content = issue.body || '';
  return {
    id: issue.number,
    title: issue.title,
    content: content,
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    author: { name: issue.user.login, avatar: issue.user.avatar_url },
    labels: issue.labels.map((label) => ({ id: label.id, name: label.name })),
    reactions: issue.reactions.total_count,
    comments: issue.comments,
    url: issue.html_url,
    readingTime: calculateReadingTime(content),
    excerpt: generateExcerpt(content),
    thumbnail: extractThumbnails(content),
    column: null,
    keywords: [],
  };
}

export function createPostsTransformPlugin(): Plugin {
  return {
    name: 'plugin-transform-posts',

    async transform(context: BuildContext) {
      log('开始将 Github Issues 转换为 Posts...');

      const issues = context.dataSource.github?.issues;

      if (!issues || issues.length === 0) {
        log('没有找到 issues，跳过转换。');
        context.data.posts = [];
        return;
      }

      const posts = issues.map(issueToPost);
      context.data.posts = posts;
      log(`成功转换 ${posts.length} 篇文章。`);
    },
  };
}
