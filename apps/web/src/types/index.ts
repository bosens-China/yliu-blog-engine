// export interface BlogData {
//   posts: Post[];
//   labels: Label[];
//   about: string | null;
//   columns: Column[];
//   metadata: Metadata;
// }

// export interface Post {
//   id: number;
//   title: string;
//   content: string; // 完整的 Markdown 内容
//   excerpt: string; // 自动提取的摘要（前200字符）
//   thumbnail: string[]; // 缩略图（最多3张）
//   author: {
//     login: string;
//     name: string;
//     avatar_url: string;
//   };
//   createdAt: string; // ISO 日期字符串
//   updatedAt: string;
//   labels: string[]; // 标签名称数组
//   column: string | null; // 专栏名称，null 表示无专栏
//   keywords?: string[]; // AI 生成的关键词
//   readingTime: number; // 预估阅读时间（分钟）
//   reactions: {
//     total: number;
//     thumbs_up: number;
//     heart: number;
//     hooray: number;
//     laugh: number;
//     confused: number;
//     rocket: number;
//     eyes: number;
//   };
//   comments: number;
//   originalUrl: string; // 原始 Issue 链接
// }

// export interface Label {
//   name: string;
//   color: string; // 十六进制颜色
//   description: string;
//   count: number; // 使用该标签的文章数量
// }

// export interface Column {
//   name: string;
//   description: string; // 基于文章内容自动生成
//   posts: number[]; // 文章 ID 数组，按发布时间排序
//   count: number; // 文章数量
//   lastUpdated: string; // 最后更新时间
//   thumbnail?: string; // 专栏缩略图
// }

// export interface Metadata {
//   totalPosts: number;
//   totalColumns: number;
//   totalLabels: number;
//   lastUpdate: string;
//   repository: string;
//   avatarUrl: string;
//   title: string;
//   url: string;
//   description?: string; // AI 生成的站点描述
//   keywords?: string[]; // AI 生成的站点关键词
// }

// // 搜索结果类型
// export interface SearchResult {
//   item: Post;
//   score?: number;
// }

// // 分页参数类型
// export interface PaginationProps {
//   currentPage: number;
//   totalPages: number;
//   baseUrl: string;
//   searchParams?: Record<string, string>;
// }

// Header 菜单项类型
export interface MenuItem {
  type: 'builtin' | 'label';
  text: string;
  // 内置菜单类型：latest, categories, columns, about
  builtin?: 'latest' | 'categories' | 'columns' | 'about';
  // 自定义标签配置
  label?: string;
  // 是否显示（可选，默认 true）
  show?: boolean;
}

// Header 菜单配置类型
export interface HeaderConfig {
  items: MenuItem[];
}
