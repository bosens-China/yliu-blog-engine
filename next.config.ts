import { codeInspectorPlugin } from "code-inspector-plugin";
import type { NextConfig } from "next";

// 智能解析 basePath
function getBasePath(): string {
  // 1. 优先使用显式设置的环境变量
  if (process.env.NEXT_PUBLIC_BASE_PATH) {
    return process.env.NEXT_PUBLIC_BASE_PATH;
  }

  // 2. 在 GitHub Action 环境中自动解析
  if (process.env.GITHUB_ACTIONS && process.env.NEXT_PUBLIC_GITHUB_REPOSITORY) {
    const [owner, repo] = process.env.NEXT_PUBLIC_GITHUB_REPOSITORY.split("/");
    // 如果仓库名是 owner.github.io，则不需要 basePath
    if (repo === `${owner}.github.io`) {
      return "";
    }
    // 否则使用仓库名作为 basePath
    return `/${repo}`;
  }

  // 3. 本地开发或其他环境，不设置 basePath
  return "";
}

const basePath = getBasePath();

const nextConfig: NextConfig = {
  // 配置页面扩展名
  pageExtensions: ["js", "jsx", "ts", "tsx"],

  // 静态导出配置
  output: "export",
  trailingSlash: true,

  // 智能 basePath 配置
  ...(basePath && {
    basePath,
    assetPrefix: basePath,
  }),

  // 图片优化配置（静态导出兼容）
  images: {
    unoptimized: true, // 静态导出时必须禁用图片优化
    remotePatterns: [
      {
        protocol: "https" as const,
        hostname: "**",
        port: "",
        pathname: "**",
      },
    ],
  },
  webpack: (config) => {
    config.plugins.push(codeInspectorPlugin({ bundler: "webpack" }));
    return config;
  },

  experimental: {
    optimizePackageImports: ["@/components"],
  },

  assetPrefix: process.env.ASSET_PREFIX || undefined,
};

export default nextConfig;
