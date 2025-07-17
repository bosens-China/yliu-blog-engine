# 快速上手

本指南将引导您在 5 分钟内，通过我们的 GitHub Action，将您的 GitHub 仓库转变为一个功能完备的个人博客。

## 前提条件

- 一个您拥有读写权限的**公开 (Public)** GitHub 仓库。

您可以创建一个全新的仓库，或者直接使用您已有的项目仓库。本引擎将会读取该仓库的 Issues 作为您的博客文章。

## 步骤一：创建 Workflow 文件

这是您唯一需要手动操作的一步。

1.  在您的 GitHub 仓库中，导航到 `.github/workflows/` 目录。如果这个目录不存在，请创建它。
2.  在该目录下创建一个名为 `blog.yml` 的新文件。

## 步骤二：粘贴 Workflow 内容

将以下内容完整地复制并粘贴到您刚刚创建的 `blog.yml` 文件中。

```yaml
# .github/workflows/blog.yml

name: Deploy Blog

on:
  # 允许您在 Actions 页面手动触发此工作流
  workflow_dispatch:

  # 当您的 Issues 发生任何变化时，自动触发
  issues:
    types: [opened, edited, closed, reopened, labeled, unlabeled]

# 授予工作流部署到 GitHub Pages 的权限
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
        uses: bosens-China/yliu-blog-engine@v1
        with:
          # 强烈推荐：使用 GitHub 自动提供的令牌以避免 API 速率限制
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

保存并提交这个文件。

## 🎉 部署完成！

恭喜您！自动化部署流程已经配置完毕。

### 您的第一篇文章

现在，去您的仓库创建一个新的 Issue。给它一个标题，一些内容，再随意添加几个标签 (Labels)。当您创建或修改 Issue 后，您刚刚配置的 Action 就会被自动触发。

### 查看您的站点

1.  在您的仓库页面，点击 **Actions** 标签页，您会看到一个名为 `Deploy Blog` 的工作流正在运行。
2.  等待工作流执行完毕（通常需要 1-2 分钟）。
3.  工作流成功后，导航到仓库的 **Settings** > **Pages** 页面。
4.  您会在这里看到您的博客已经被成功部署，并可以找到公开访问的 URL。

## 下一步

现在您的博客已经成功运行，您可能希望进行一些个性化设置。请继续阅读我们的其他指南：

- **[高级定制](./customization.md)**: 学习如何设置博客标题、自定义导航菜单、配置专栏等。
- **[AI 增强](./ai-enhancement.md)**: 了解如何连接 AI 服务来自动优化您的博客内容。