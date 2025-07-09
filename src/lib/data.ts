import blogData from "@/data/blog-data.json";
import type { BlogData, Post, Label, Column } from "@/types";
import Fuse from "fuse.js";
import { HeaderConfig, MenuItem } from "@/types";

// 统一设置每页记录数
export const ITEMS_PER_PAGE = 15;

/**
 * 获取所有博客数据
 */
export function getBlogData(): BlogData {
  return blogData;
}

/**
 * 获取所有文章（支持分页）
 */
export function getPosts(
  page = 1,
  pageSize = ITEMS_PER_PAGE
): { posts: Post[]; totalPages: number; currentPage: number; total: number } {
  const data = getBlogData();
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  // 按创建时间倒序排序
  const sortedPosts = [...data.posts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return {
    posts: sortedPosts.slice(startIndex, endIndex),
    totalPages: Math.ceil(data.posts.length / pageSize),
    currentPage: page,
    total: data.posts.length,
  };
}

/**
 * 根据ID获取单篇文章
 */
export function getPostById(id: number): Post | null {
  const data = getBlogData();
  return data.posts.find((post) => post.id === id) || null;
}

/**
 * 获取最新文章
 */
export function getLatestPosts(limit = 5): Post[] {
  const data = getBlogData();
  return [...data.posts]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, limit);
}

/**
 * 获取所有标签
 */
export function getLabels(): Label[] {
  const data = getBlogData();
  return data.labels;
}

/**
 * 根据标签获取文章（支持分页）
 */
export function getPostsByLabel(
  labelName: string,
  page = 1,
  pageSize = ITEMS_PER_PAGE
): { posts: Post[]; totalPages: number; currentPage: number; total: number } {
  const data = getBlogData();
  const filteredPosts = data.posts
    .filter((post) =>
      post.labels.some(
        (label) => label.toLowerCase() === labelName.toLowerCase()
      )
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    posts: filteredPosts.slice(startIndex, endIndex),
    totalPages: Math.ceil(filteredPosts.length / pageSize),
    currentPage: page,
    total: filteredPosts.length,
  };
}

/**
 * 获取所有专栏
 */
export function getColumns(): Column[] {
  const data = getBlogData();
  return data.columns;
}

/**
 * 根据专栏名称获取专栏
 */
export function getColumnByName(columnName: string): Column | null {
  const data = getBlogData();
  return data.columns.find((column) => column.name === columnName) || null;
}

/**
 * 根据专栏名称获取文章（支持分页）
 */
export function getPostsByColumn(
  columnName: string,
  page = 1,
  pageSize = ITEMS_PER_PAGE
): { posts: Post[]; totalPages: number; currentPage: number; total: number } {
  const data = getBlogData();
  const filteredPosts = data.posts
    .filter((post) => post.column === columnName)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    posts: filteredPosts.slice(startIndex, endIndex),
    totalPages: Math.ceil(filteredPosts.length / pageSize),
    currentPage: page,
    total: filteredPosts.length,
  };
}

/**
 * 搜索文章（支持分页）
 */
export function searchPosts(
  query: string,
  page = 1,
  pageSize = ITEMS_PER_PAGE
): { posts: Post[]; totalPages: number; currentPage: number; total: number } {
  const data = getBlogData();

  if (!query.trim()) {
    return { posts: [], totalPages: 0, currentPage: page, total: 0 };
  }

  const fuse = new Fuse(data.posts, {
    keys: [
      { name: "title", weight: 0.4 },
      { name: "excerpt", weight: 0.3 },
      { name: "labels", weight: 0.2 },
      { name: "column", weight: 0.1 },
    ],
    threshold: 0.3,
    includeScore: true,
  });

  const results = fuse.search(query).map((result) => result.item);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    posts: results.slice(startIndex, endIndex),
    totalPages: Math.ceil(results.length / pageSize),
    currentPage: page,
    total: results.length,
  };
}

/**
 * 获取相关文章
 */
export function getRelatedPosts(post: Post, limit = 3): Post[] {
  const data = getBlogData();

  // 根据标签相似度计算相关性
  const otherPosts = data.posts.filter((p) => p.id !== post.id);

  const scoredPosts = otherPosts.map((otherPost) => {
    const commonLabels = otherPost.labels.filter((label) =>
      post.labels.includes(label)
    );
    const columnMatch = post.column && otherPost.column === post.column ? 1 : 0;
    const score = commonLabels.length + columnMatch;

    return { post: otherPost, score };
  });

  return scoredPosts
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.post);
}

/**
 * 获取博客统计信息
 */
export function getBlogStats() {
  const data = getBlogData();

  const totalReadingTime = data.posts.reduce(
    (sum, post) => sum + post.readingTime,
    0
  );
  const averageReadingTime = Math.round(totalReadingTime / data.posts.length);

  return {
    postsCount: data.posts.length,
    columnsCount: data.columns.length,
    labelsCount: data.labels.length,
    averageReadingTime,
  };
}

// 解析 Header 菜单配置
export function getHeaderConfig(): HeaderConfig {
  const configStr = process.env.NEXT_PUBLIC_HEADER_MENU_CONFIG;

  // 默认菜单配置
  const defaultConfig: HeaderConfig = {
    items: [
      { type: "builtin", text: "最新文章", builtin: "latest" },
      { type: "builtin", text: "分类", builtin: "categories" },
      { type: "builtin", text: "专栏", builtin: "columns" },
      { type: "builtin", text: "关于我", builtin: "about" },
    ],
  };

  if (!configStr) {
    return defaultConfig;
  }

  try {
    const config = JSON.parse(configStr) as HeaderConfig;

    // 验证配置格式
    if (!config.items || !Array.isArray(config.items)) {
      console.warn("Invalid header config format, using default");
      return defaultConfig;
    }

    // 验证每个菜单项
    const validItems = config.items.filter((item: MenuItem) => {
      if (!item.type || !item.text) {
        console.warn("Invalid menu item:", item);
        return false;
      }

      if (item.type === "builtin" && !item.builtin) {
        console.warn("Builtin menu item missing builtin type:", item);
        return false;
      }

      if (item.type === "label" && !item.label) {
        console.warn("Label menu item missing label:", item);
        return false;
      }

      return true;
    });

    return { items: validItems };
  } catch (error) {
    console.warn("Failed to parse header config:", error);
    return defaultConfig;
  }
}
