import { defineConfig } from 'vitepress';

/**
 * 动态计算 base 路径
 */
const base = process.env.GITHUB_REPOSITORY
  ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`
  : '/';

// --- 侧边栏分组 ---
// 通过定义侧边栏分组，可以方便地复用和管理文档结构

const guideSidebar = [
  {
    text: '指南',
    items: [
      { text: '快速上手', link: '/getting-started' },
      { text: '高级定制', link: '/customization' },
      { text: 'AI 增强', link: '/ai-enhancement' },
    ],
  },
];

const referenceSidebar = [
  {
    text: '参考',
    items: [
      { text: '核心配置', link: '/reference/core' },
      { text: '定制化', link: '/reference/customization' },
      { text: 'AI 增强', link: '/reference/ai' },
      { text: '高级选项', link: '/reference/advanced' },
    ],
  },
];

const developmentSidebar = [
  {
    text: '开发',
    items: [{ text: '本地开发与主题定制', link: '/local-development' }],
  },
];

// --- 站点配置 ---
// 参考：https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'YLiu Blog Engine',
  description: '一个基于 GitHub Issues 的现代博客解决方案',
  base: base,
  cleanUrls: true,

  themeConfig: {
    // 主题配置参考：https://vitepress.dev/reference/default-theme-config
    logo: '/logo.svg',

    // 更结构化的导航栏
    nav: [
      { text: '指南', link: '/getting-started' },
      { text: '环境变量', link: '/reference/core' },
      { text: '本地开发', link: '/local-development' },
    ],

    // 多侧边栏配置
    // 根据当前页面路径显示对应的侧边栏
    sidebar: {
      '/getting-started': guideSidebar,
      '/customization': guideSidebar,
      '/ai-enhancement': guideSidebar,
      '/local-development': developmentSidebar,
      // Match all pages under the /reference/ path to the reference sidebar
      '/reference/': referenceSidebar,
    },

    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/bosens-China/yliu-blog-engine',
      },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Young Liu',
    },

    editLink: {
      pattern:
        'https://github.com/bosens-China/yliu-blog-engine/edit/main/apps/docs/:path',
      text: '在 GitHub 上编辑此页',
    },
  },
});
