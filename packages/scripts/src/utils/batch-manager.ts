import type { Post } from '@yliu/types/blog';
import { log, warn } from '@/utils/logger';
import { env } from '@/config/env';

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

/**
 * 文章批处理管理器
 * 负责将文章按复杂规则（字符数、文章数、截断等）进行分批。
 */
export class BatchManager {
  private config = {
    MAX_CHARS_PER_BATCH: env.AI_MAX_CHARS_PER_BATCH,
    SINGLE_ARTICLE_THRESHOLD: env.AI_SINGLE_ARTICLE_THRESHOLD,
    MAX_ARTICLES_PER_BATCH: env.AI_MAX_ARTICLES_PER_BATCH,
    ARTICLE_TRUNCATE_LENGTH: env.AI_ARTICLE_TRUNCATE_LENGTH,
    TRUNCATE_SUFFIX: env.AI_TRUNCATE_SUFFIX,
  };

  /**
   * 创建文章批次
   * @param posts 需要处理的文章数组
   * @returns 包含批次数组的对象
   */
  public createBatches(posts: Post[]): ArticleBatch[] {
    log(`📊 开始为 ${posts.length} 篇文章进行智能分批...`);

    const batches: ArticleBatch[] = [];
    let currentBatch: Post[] = [];
    let currentBatchChars = 0;
    let batchIndex = 0; // 1. 初始化批次索引计数器

    const sortedPosts = [...posts].sort(
      (a, b) => a.content.length - b.content.length,
    );

    for (const post of sortedPosts) {
      const { processedPost, wasTruncated } = this.truncatePost(post);
      const processedLength = processedPost.content.length;

      if (processedLength > this.config.SINGLE_ARTICLE_THRESHOLD) {
        if (currentBatch.length > 0) {
          batches.push({
            articles: currentBatch,
            totalChars: currentBatchChars,
            type: 'normal',
            batchIndex: batchIndex++, // 2. 添加 batchIndex 并自增
          });
          currentBatch = [];
          currentBatchChars = 0;
        }
        batches.push({
          articles: [processedPost],
          totalChars: processedLength,
          type: 'oversized',
          batchIndex: batchIndex++, // 2. 添加 batchIndex 并自增
        });
        log(
          `🚀 超大文章单独成批: "${post.title}" (${processedLength.toLocaleString()} 字符)${wasTruncated ? ' [已截断]' : ''}`,
        );
      } else {
        const wouldExceedChars =
          currentBatchChars + processedLength > this.config.MAX_CHARS_PER_BATCH;
        const wouldExceedCount =
          currentBatch.length + 1 > this.config.MAX_ARTICLES_PER_BATCH;

        if (currentBatch.length > 0 && (wouldExceedChars || wouldExceedCount)) {
          batches.push({
            articles: currentBatch,
            totalChars: currentBatchChars,
            type: 'normal',
            batchIndex: batchIndex++, // 2. 添加 batchIndex 并自增
          });
          currentBatch = [processedPost];
          currentBatchChars = processedLength;
        } else {
          currentBatch.push(processedPost);
          currentBatchChars += processedLength;
        }
      }
    }

    if (currentBatch.length > 0) {
      batches.push({
        articles: currentBatch,
        totalChars: currentBatchChars,
        type: 'normal',
        batchIndex: batchIndex++, // 2. 添加 batchIndex 并自增
      });
    }

    this.printBatchStats(posts.length, batches);
    return batches;
  }

  private truncatePost(post: Post): {
    processedPost: Post;
    wasTruncated: boolean;
  } {
    if (post.content.length > this.config.ARTICLE_TRUNCATE_LENGTH) {
      warn(
        `✂️ 文章已截断: "${post.title}" (从 ${post.content.length.toLocaleString()} 字符)`,
      );
      return {
        processedPost: {
          ...post,
          content:
            post.content.slice(0, this.config.ARTICLE_TRUNCATE_LENGTH) +
            this.config.TRUNCATE_SUFFIX,
        },
        wasTruncated: true,
      };
    }
    return { processedPost: post, wasTruncated: false };
  }

  private printBatchStats(totalArticles: number, batches: ArticleBatch[]) {
    const oversizedCount = batches.filter((b) => b.type === 'oversized').length;
    log(`\n📈 智能分批完成:`);
    log(`   总文章数: ${totalArticles}`);
    log(`   总批次数: ${batches.length}`);
    log(`   超大文章批次: ${oversizedCount}`);

    batches.forEach((batch) => {
      // 使用 batchIndex 替代 index
      const icon = batch.type === 'oversized' ? '🚀' : '📦';
      log(
        `   ${icon} 批次 ${batch.batchIndex + 1}: ${batch.articles.length} 篇文章, ${batch.totalChars.toLocaleString()} 字符`,
      );
    });
    log('');
  }
}
