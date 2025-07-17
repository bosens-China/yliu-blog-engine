/**
 * 作者信息
 */
export interface Author {
  name: string;
  avatar: string;
}

/**
 * 单篇文章的完整结构。
 * 这是在整个项目中共享的核心数据模型。
 */
export interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: string; // ISO 8601 格式的字符串, e.g., "2023-10-27T08:00:00Z"
  updatedAt: string; // ISO 8601 格式的字符串

  // 派生或关联数据
  author: Author;
  labels: string[]; // 标签名称列表, e.g., ["React", "TypeScript"]
  column: string | null; // 所属专栏的名称, e.g., "深入浅出设计模式"

  // 用于渲染和SEO的元数据
  url: string; // GitHub Issue 原始链接
  reactions: number;
  comments: number;
  readingTime: number; // 预估阅读分钟数
  excerpt: string; // 摘要，由AI或自动生成
  thumbnail: string[]; // 缩略图 URL 列表 (最多3个)
  keywords: string[]; // SEO 关键词
}

/**
 * 标签的结构
 */
export interface Label {
  name: string;
  color: string; // Hex color string, e.g., "e7e7e7"
  description: string | null;
  count: number; // 拥有此标签的文章数量
}

/**
 * 专栏的结构
 */
export interface Column {
  name: string;
  description: string;
  posts: number[]; // 包含的文章 ID 列表
  count: number;
  lastUpdated: string; // 专栏内最新文章的更新时间
}

/**
 * 站点的全局元数据
 */
export interface Metadata {
  totalPosts: number;
  totalLabels: number;
  totalColumns: number;
  lastUpdate: string; // 本次构建的时间
  repository: string; // e.g., "owner/repo"
  avatarUrl: string; // 作者头像 URL
  title: string; // 博客主标题
  description: string; // 博客描述
  keywords: string[]; // 全局关键词
  url: string; // 博客主页 URL
  author: string; // 作者名称
  headerConfig: string | null; // Header 菜单配置 (JSON 字符串)
}

/**
 * blog-data.json 的顶层结构。
 * 这是脚本最终输出的、Next.js 直接消费的类型。
 */
export interface BlogData {
  posts: Post[];
  labels: Label[];
  columns: Column[];
  metadata: Metadata;
  about: string | null; // about.md 的内容
}
