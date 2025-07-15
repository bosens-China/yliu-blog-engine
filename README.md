# YLiu Blog Engine

[![Deploy Docs](https://github.com/bosens-China/yliu-blog-engine/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/bosens-China/yliu-blog-engine/actions/workflows/deploy-docs.yml)
[![Release Please](https://github.com/bosens-China/yliu-blog-engine/actions/workflows/release-please.yml/badge.svg)](https://github.com/bosens-China/yliu-blog-engine/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Stars](https://img.shields.io/github/stars/bosens-China/yliu-blog-engine?style=social)](https://github.com/bosens-China/yliu-blog-engine/stargazers)

一个基于 Next.js 和 GitHub Issues 构建的现代化、高性能博客引擎。让你专注于写作，而非繁琐的后台。

**[查看 Demo](https://bosens-china.github.io/yliu-blog-engine/demo) | [阅读完整文档](https://bosens-china.github.io/yliu-blog-engine/docs)**

![YLiu Blog Engine 截图](https://user-images.githubusercontent.com/path/to/your/screenshot.png)
_<p align="center">在这里放一张你的博客主页或文章页的精美截图</p>_

---

## ✨ 核心特性

- 🚀 **GitHub Issues 驱动**: 使用你最熟悉的方式进行创作。Issues 即文章，Labels 即分类，无需额外后台。
- 🤖 **AI 增强 (可选)**: 可对接 AI 服务，自动优化 SEO、智能分析专栏，让你的内容更专业。
- ⚡️ **一键部署**: 内置强大的 GitHub Action，只需几分钟即可将你自己的博客部署到 GitHub Pages。
- 🎨 **精致主题**: 响应式设计，提供舒适的亮暗模式和代码高亮。
- 🔧 **高度可定制**: 从博客标题、导航菜单到 AI 服务，一切皆可配置。
- 现代化的技术栈: **Next.js (App Router), React 19, TypeScript, pnpm Workspaces**。

## 🚀 快速拥有你的博客

我们为不同需求的用户提供了清晰的路径。

| 我想...                    | 我应该去...                                                                                                      |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **快速拥有一个自己的博客** | ➡️ **[快速上手指南 (一键部署)](https://bosens-china.github.io/yliu-blog-engine/docs/getting-started/for-users)** |
| **深入了解所有配置和功能** | ➡️ **[查阅完整文档](https://bosens-china.github.io/yliu-blog-engine/docs)**                                      |
| **在本地运行和开发项目**   | ➡️ **[本地开发指南](https://bosens-china.github.io/yliu-blog-engine/docs/getting-started/for-developers)**       |
| **为这个项目贡献代码**     | ➡️ **[贡献指南](https://bosens-china.github.io/yliu-blog-engine/docs/contributing/guide)**                       |

## 📦 作为 Action 使用

你可以直接在你的 workflow 中使用这个项目，来为你自己的内容仓库构建和部署博客。

```yaml
steps:
  - name: Deploy My Blog
    uses: bosens-China/yliu-blog-engine@v1 # 推荐使用主版本号
    with:
      # 必需：你的 GitHub Token
      GITHUB_TOKEN: ${{ secrets.YOUR_ACTION_TOKEN }}
      # 必需：你的内容仓库地址
      NEXT_PUBLIC_GITHUB_REPOSITORY: 'your-username/your-blog-repo'
      # 可选：自定义你的博客标题
      NEXT_PUBLIC_BLOG_TITLE: '我的数字花园'
      # ... 更多配置请查阅文档
```

## 🤝 贡献

本项目是一个开源项目，我们欢迎任何形式的贡献！请先阅读我们的 **[贡献指南](https://bosens-china.github.io/yliu-blog-engine/docs/contributing/guide)**。

如果您发现了 Bug 或有功能建议，请随时在 [Issues](https://github.com/bosens-China/yliu-blog-engine/issues) 中提出。

## 📄 许可证

本项目基于 **[MIT License](LICENSE)** 授权。
