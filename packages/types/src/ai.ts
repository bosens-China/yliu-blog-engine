import { Label } from './issues';

// 用于专栏分析的单篇文章信息
export interface ColumnInputItem {
  id: number;
  title: string;
}

// 专栏分析服务的完整输入结构
export interface DifyColumnsInput {
  articles: ColumnInputItem[];
}

// 用于文章SEO分析的单篇文章信息
export interface PostSeoInputItem {
  id: number;
  title: string;
  // 从 GithubIssue 的 body 字段获取
  content: string;
  // 从 GithubIssue 的 labels 字段提取名称
  labels: Pick<Label, 'name' | 'id'>[];
}

// 文章SEO分析服务的完整输入结构（一个批次）
export interface DifyPostSeoInput {
  articles: PostSeoInputItem[];
}

// 从第二步的输出中提取，用于站点SEO分析的单篇文章SEO信息
export interface PostSeoResultItem {
  id: number;
  optimized_title: string;
  description: string;
  keywords: string[];
  tags: string[];
}

// 站点SEO分析服务的完整输入结构
export interface DifySiteSeoInput {
  all_articles_seo: PostSeoResultItem[];
}

/**
 * 代表一个被识别出的专栏及其包含的文章。
 */
export interface ColumnOutput {
  name: string;
  description: string;
  article_ids: number[];
}

/**
 * “专栏分析”服务返回的完整、可解析的 JSON 对象类型。
 */
export interface DifyColumnsOutput {
  columns: ColumnOutput[];
}

/**
 * 代表单篇文章经过 SEO 优化后的元数据。
 */
export interface PostSeoOutput {
  id: number;
  optimized_title: string;
  description: string;
  keywords: string[];
  tags: string[];
}
/**
 * 代表对一次处理批次的宏观分析总结。
 */
export interface BatchSummaryOutput {
  common_themes: string[];
  overall_sentiment: string;
}

/**
 * “文章 SEO”服务返回的完整、可解析的 JSON 对象类型。
 * 包含了单篇优化的结果和对整个批次的总结。
 */
export interface DifyPostSeoOutput {
  articles_seo: PostSeoOutput[];
  batch_summary: BatchSummaryOutput;
}

/**
 * 代表网站的全局元数据，可直接用于页面的 <meta> 标签。
 */
export interface SiteMetaOutput {
  title: string;
  description: string;
  keywords: string[];
  tagline: string;
}

/**
 * “站点 SEO”服务返回的完整、可解析的 JSON 对象类型。
 */
export interface DifySiteSeoOutput {
  site_meta: SiteMetaOutput;
}
