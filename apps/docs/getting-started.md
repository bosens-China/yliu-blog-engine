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

name: Blog CI

on:
  issues:
    types:
      - opened
      - edited
      - deleted
      - closed
      - reopened
      - labeled
      - unlabeled
  workflow_dispatch:

# 并发控制：确保只运行最新的构建任务
# group: ${{ github.workflow }} - 将所有由此工作流触发的任务归为一组
# cancel-in-progress: true - 当新任务启动时，自动取消同一组内正在运行的旧任务
concurrency:
  group: ${{ github.workflow }}
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      issues: write
      pull-requests: write
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Build Blog
        uses: yiliang114/yliu-blog-engine@main # 引用你的 Action
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          repo: ${{ github.repository }}
          issue_number: ${{ github.event.issue.number }}
          branch: 'gh-pages' # 你希望部署到的分支
```

保存并提交这个文件。

::: tip
您可能会注意到，当您创建一个新的 Issue 并为其添加标签时，CI 流程可能会被触发多次。这是因为您的每个动作（`创建`、`打标签`、`编辑`）都对应着 `on.issues.types` 中监听的一个事件类型。

`concurrency` 配置可以完美解决这个问题。它能确保对于同一个 Issue，只有一个构建任务可以处于“正在运行”的状态。如果一个新的构建被触发，它会自动取消掉前一个正在运行的构建，从而只执行最新的构建，节省您的构建资源。
:::

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
