# YLiu Blog Engine

基于 Next.js 搭建的现代博客引擎，通过 GitHub Issues 驱动内容管理，支持高度定制和 AI 智能增强。

## ✨ 核心特性

- 🌓 **主题切换**：支持明暗主题自动切换
- 📱 **响应式设计**：完美适配 PC、平板和移动端
- 🤖 **AI 增强**：智能生成文章摘要、SEO 优化和专栏分类
- 🎨 **高度定制**：灵活的配置选项，满足个性化需求
- ⚡ **零配置部署**：基于 GitHub Actions 的一键部署
- 📝 **Issues 驱动**：直接通过 GitHub Issues 管理博客内容

## 🚀 快速开始

```yaml
# 在你的 .github/workflows/blog.yml 中
name: Deploy Blog
on:
  push:
    branches: [main]
  issues:
    types: [opened, edited, closed, reopened]

permissions:
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: bosens-China/yliu-blog-engine@main
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }} # 可选，启用 AI 功能
```

## 📚 文档

- [快速开始指南](./apps/docs/getting-started.md)
- [自定义配置](./apps/docs/customization.md)
- [AI 增强功能](./apps/docs/ai-enhancement.md)
- [本地开发](./apps/docs/local-development.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 开源协议

[MIT License](./LICENSE)
