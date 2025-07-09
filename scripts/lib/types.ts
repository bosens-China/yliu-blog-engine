import type { Column, SiteMeta } from "@/lib/ai";

export interface GithubIssue {
  number: number;
  title: string;
  body: string | null;
  created_at: string;
  updated_at: string;
  user: {
    login: string;
    avatar_url: string;
  };
  labels: {
    name: string;
    color: string;
    description: string | null;
  }[];
  reactions: {
    total_count: number;
    "+1": number;
    heart: number;
    hooray: number;
    laugh: number;
    confused: number;
    rocket: number;
    eyes: number;
  };
  comments: number;
  html_url: string;
}

export interface EnhancedPost {
  id: string;
  summary: string;
  keywords: string[];
}

export interface AIEnhancements {
  site_meta: SiteMeta;
  columns: Column[];
  enhanced_posts: EnhancedPost[];
}

export interface DifyCache {
  site_meta: SiteMeta;
  columns: Column[];
  enhanced_posts: Record<string, EnhancedPost & { updatedAt: string }>;
}
