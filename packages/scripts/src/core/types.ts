import type { Post, Column, Label, Metadata } from '@yliu/types/blog';
import type { GithubIssue } from '@yliu/types/issues';
import type { Repo } from '@yliu/types/repo';
import type {
  PostSeoOutput,
  ColumnOutput,
  SiteMetaOutput,
} from '@yliu/types/ai';
import type { CacheManager } from './cache';

/**
 * AI 增强结果的统一结构
 */
export interface AIEnhancements {
  postsSeo: PostSeoOutput[];
  columns: ColumnOutput[];
  siteMeta: SiteMetaOutput | null;
}

/**
 * 存放从外部获取的原始数据。
 * 所有 resource 插件的产出类型都在这里定义为可选属性。
 */
export interface DataSource {
  github?: {
    issues: GithubIssue[];
    repoDetails: Repo | null;
  };
}

/**
 * 存放处理和转换后的数据。
 * 所有 transform 插件的产出/修改类型都在这里定义为可选属性。
 */
export interface TransformedData {
  posts?: Post[];
  aiEnhancements?: AIEnhancements;
  columns?: Column[];
  labels?: Label[];
  metadata?: Metadata;
  about?: string | null;
}

/**
 * 构建上下文的最终、完整接口。
 * 项目中所有地方都应该导入并使用这个接口。
 */
export interface BuildContext {
  config: {
    isDev: boolean;
    repo: {
      owner: string;
      name: string;
    };
    outputDir: string; // 用于存放 blog-data.json 等数据文件
    webAppDir: string; // 新增：用于存放 public/images 等静态资源
  };
  cache: CacheManager;
  dataSource: DataSource;
  data: TransformedData;
}

/**
 * 缓存数据结构的类型定义。
 */
export interface CacheableData {
  hotlinkDomains?: Record<string, boolean>;
  aiPostsSeoCache?: Record<string, PostSeoOutput>;
}
