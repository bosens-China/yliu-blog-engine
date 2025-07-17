# YLiu Blog Engine

[![Deploy Docs](https://github.com/bosens-China/yliu-blog-engine/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/bosens-China/yliu-blog-engine/actions/workflows/deploy-docs.yml)
[![Release Please](https://github.com/bosens-China/yliu-blog-engine/actions/workflows/release-please.yml/badge.svg)](https://github.com/bosens-China/yliu-blog-engine/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Stars](https://img.shields.io/github/stars/bosens-China/yliu-blog-engine?style=social)](https://github.com/bosens-China/yliu-blog-engine/stargazers)

一个基于 Next.js 和 GitHub Issues 构建的现代化、高性能博客引擎。让你专注于写作，而非繁琐的后台。

**[阅读完整文档](https://bosens-china.github.io/yliu-blog-engine/)**

## ✨ 核心特性

- 🚀 **GitHub Issues 驱动**: 使用你最熟悉的方式进行创作。Issues 即文章，Labels 即分类，无需额外后台。
- 🤖 **AI 增强 (可选)**: 可对接 AI 服务，自动优化 SEO、智能分析专栏，让你的内容更专业。
- ⚡️ **一键部署**: 内置强大的 GitHub Action，只需几分钟即可将你自己的博客部署到 GitHub Pages。
- 🎨 **精致主题**: 响应式设计，提供舒适的亮暗模式和代码高亮。
- 🔧 **高度可定制**: 从博客标题、导航菜单到 AI 服务，一切皆可配置。
- 现代化的技术栈: **Next.js (App Router), React 19, TypeScript, pnpm Workspaces**。

## 🚀 如何使用

我们为不同需求的用户提供了清晰的路径。

| 如果您想...                | 您应该阅读...                                           |
| -------------------------- | ------------------------------------------------------- |
| **快速拥有一个自己的博客** | ➡️ **[快速上手指南](./apps/docs/getting-started.md)**   |
| **进行个性化设置**         | ➡️ **[高级定制指南](./apps/docs/customization.md)**     |
| **启用 AI 增强功能**       | ➡️ **[AI 增强指南](./apps/docs/ai-enhancement.md)**     |
| **在本地运行或二次开发**   | ➡️ **[本地开发指南](./apps/docs/local-development.md)** |
| **查看所有可用配置**       | ➡️ **[环境变量参考](./apps/docs/env-variables.md)**     |

## 📦 作为 Action 使用

在您的内容仓库中，创建一个 `.github/workflows/blog.yml` 文件，并粘贴以下内容：

```yaml
name: Deploy Blog

on:
  workflow_dispatch:
  issues:
    types: [opened, edited, closed, reopened, labeled, unlabeled]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: bosens-China/yliu-blog-engine@v1 # 推荐使用主版本号
        with:
          # [推荐] 使用 GitHub 自动提供的令牌以避免 API 速率限制
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

          # [可选] 自定义您的博客标题
          # NEXT_PUBLIC_BLOG_TITLE: '我的数字花园'

          # ... 更多配置请查阅文档
```

## 🤝 贡献

本项目是一个开源项目，我们欢迎任何形式的贡献！请先阅读我们的 **[本地开发指南](./apps/docs/local-development.md)**，它将帮助您在本地将项目跑起来。

如果您发现了 Bug 或有功能建议，请随时在 [Issues](https://github.com/bosens-China/yliu-blog-engine/issues) 中提出。

## 📄 许可证

本项目基于 **[MIT License](LICENSE)** 授权。
