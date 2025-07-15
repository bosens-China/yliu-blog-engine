import type { Post } from '@yliu/types/blog';

/**
 * AI批处理配置
 * 用于控制文章批量处理的各种参数
 */

export const AI_BATCH_CONFIG = {
  // 批次字符限制 (5w字符，为prompt和响应留余量)
  MAX_CHARS_PER_BATCH: 50000,

  // 单篇文章处理阈值 (4w字符以上单独处理)
  SINGLE_ARTICLE_THRESHOLD: 40000,

  // 每批最大文章数量
  MAX_ARTICLES_PER_BATCH: 15,

  // 文章截断长度 (超长文章slice到这个长度)
  ARTICLE_TRUNCATE_LENGTH: 45000,

  // 截断后缀说明
  TRUNCATE_SUFFIX: '\n\n[注：文章内容已截取，以上为主要部分]',

  // 是否启用AI处理
  ENABLE_AI_PROCESSING: true,

  // 并发处理限制
  MAX_CONCURRENT_REQUESTS: 3,
} as const;

/**
 * 批处理统计信息
 */
export interface BatchStats {
  totalArticles: number;
  normalBatches: number;
  oversizedArticles: number;
  truncatedArticles: number;
  totalBatches: number;
}

/**
 * 文章批次信息
 */
export interface ArticleBatch {
  articles: Post[];
  totalChars: number;
  batchIndex: number;
  type: 'normal' | 'oversized';
}
