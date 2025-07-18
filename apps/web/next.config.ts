import { codeInspectorPlugin } from 'code-inspector-plugin';
import type { NextConfig } from 'next';

// 智能解析 basePath
function getBasePath(): string {
  // 优先使用显式设置的环境变量
  return process.env.NEXT_PUBLIC_BASE_PATH || '';
}

const basePath = getBasePath();

const nextConfig: NextConfig = {
  // 配置页面扩展名
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],

  // 静态导出配置
  output: 'export',
  trailingSlash: true,

  // 智能 basePath 配置
  // 这里的 assetPrefix 会被正确设置，不要在后面覆盖它
  ...(basePath && {
    basePath,
    assetPrefix: basePath,
  }),

  // 图片优化配置（静态导出兼容）
  images: {
    unoptimized: true, // 静态导出时必须禁用图片优化
    remotePatterns: [
      {
        protocol: 'https' as const,
        hostname: '**',
        port: '',
        pathname: '**',
      },
    ],
  },
  webpack: (config) => {
    config.plugins.push(codeInspectorPlugin({ bundler: 'webpack' }));
    return config;
  },

  experimental: {
    optimizePackageImports: ['@/components'],
  },
};

export default nextConfig;
