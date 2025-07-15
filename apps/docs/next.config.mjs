import nextra from 'nextra';

const withNextra = nextra({});

export default withNextra({
  output: 'export', // 启用静态导出
  trailingSlash: true, // GitHub Pages 需要
  images: {
    unoptimized: true, // 禁用 Next.js 图片优化，静态站点不支持
  },
  basePath: process.env.GITHUB_REPOSITORY
    ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}`
    : '',
});
