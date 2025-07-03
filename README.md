# 小 🐑 的个人博客

一个基于 Next.js 15 + React 19 构建的现代化、高性能、易于部署的博客系统。它将您的 GitHub Issues 无缝转化为优雅的博文，让您专注于写作，而非繁琐的后台管理。

这个项目也可以作为一个模板，让任何拥有 GitHub 账户的开发者在 5 分钟内拥有一个属于自己的、功能完备的个人博客。

## ✨ 特性概览

- 🚀 **现代化技术栈**: Next.js 15 + React 19 + TypeScript + Tailwind CSS v4。
- 📝 **GitHub Issues 驱动**: 使用 GitHub Issues 作为文章的唯一来源，Labels 作为分类标签。
- 🔧 **零配置启动**: 只需一个环境变量即可启动，无需复杂的数据库或后台配置。
- 🌐 **动态导航**: 导航栏链接（如分类、专栏）会根据您的内容自动显示或隐藏。
- 🎨 **高度可定制**: 通过环境变量轻松定制博客标题、作者、页脚等信息。
- 🔍 **强大搜索**: 内置强大的模糊搜索功能，包含搜索历史和热门标签推荐。
- 🌙 **多主题支持**: 明亮、暗黑、跟随系统三种模式一键切换。
- 📱 **全平台响应式**: 完美适配桌面、平板和移动设备，并为 iOS 设备优化了安全区域。
- ⚡ **极致性能**: 默认采用 SSG (静态站点生成)，访问速度快，利于 SEO。
- 🤖 **Action 自动化**: 内置 GitHub Action，可实现 Issues 更新后自动拉取数据并部署。

## 🚀 快速开始

### 1. 环境准备

- Node.js 22+
- pnpm 10+

### 2. 使用模板或克隆

最快的方式是点击仓库主页上的 **"Use this template"** 按钮，创建一个属于您自己的新仓库。

或者，手动克隆：

```bash
git clone https://github.com/your-username/your-new-repo.git
cd your-new-repo
```

### 3. 安装依赖

```bash
pnpm install
```

### 4. 配置环境变量

在项目根目录创建一个 `.env` 文件，并根据下表填入您的配置：

| 变量名                          | 说明                                          | 必填 | 示例                           |
| ------------------------------- | --------------------------------------------- | ---- | ------------------------------ |
| `GITHUB_TOKEN`                  | GitHub 访问令牌 (推荐，可避免 API 限流)       | 否   | `ghp_xxxx...`                  |
| `NEXT_PUBLIC_GITHUB_REPOSITORY` | 你的 GitHub 仓库地址 (例如 `owner/repo`)      | 是   | `yourname/your-repo`           |
| `NEXT_PUBLIC_BLOG_TITLE`        | 博客标题 (可选, 默认为 "{仓库拥有者}的博客")  | 否   | `我的技术博客`                 |
| `NEXT_PUBLIC_FOOTER_TEXT`       | 博客页脚显示的文本 (可选)                     | 否   | `© 2024 by 小🐑`               |
| `NEXT_PUBLIC_BASE_PATH`         | 站点基础路径 (可选，GitHub Pages 自动解析)    | 否   | `/my-blog`                     |
| `NEXT_PUBLIC_ICON_URL`          | 网站图标 URL (可选，自动从仓库或默认图标获取) | 否   | `https://example.com/icon.png` |

> **提示**: `GITHUB_TOKEN` 对于公开仓库是可选的，但为了防止达到 GitHub API 的速率限制，强烈建议创建一个。您可以从 [GitHub Developer Settings](https://github.com/settings/tokens/new?scopes=repo) 获取，只需勾选 `repo` 权限即可。

### 5. 拉取文章数据

这是最关键的一步！运行以下命令，脚本会自动从您的 GitHub 仓库拉取 Issues 并生成博客所需的数据文件。

```bash
pnpm fetch
```

### 6. 启动开发服务器

```bash
pnpm dev
```

现在，在浏览器中打开 [http://localhost:3000](http://localhost:3000)，您应该能看到自己的博客了！

### 7. 构建生产版本 (可选)

如果您想生成可部署的静态文件：

```bash
pnpm build
```

构建完成后，静态文件会生成到 `out/` 目录，您可以将此目录部署到任何静态托管服务。

## 📖 文章写作

- **创建文章**: 在您的 GitHub 仓库中创建一个新的 Issue。
- **文章标题**: Issue 的标题就是文章的标题。
- **文章内容**: Issue 的正文就是文章内容，支持所有 Markdown 语法。
- **文章分类**: 为 Issue 添加 Label，它们会自动成为文章的分类。
- **发布文章**: 保持 Issue 为 `open` 状态。如果想隐藏文章，只需 `close` 该 Issue。
- **更新文章**: 修改 Issue 内容后，重新运行 `pnpm fetch` 即可同步。
- **文章摘要**: 默认截取正文前 200 个字符。若想自定义摘要，可在文中插入 `<!-- more -->` 分隔符，标记之前的内容即为摘要。

### 专栏文章

如果想将一系列文章组织成一个"专栏"，只需在标题中遵循特定格式。系统会自动识别以下模式：

- **"之"模式**: `深入JavaScript之this绑定`
- **序号模式**: `React源码解析（一）`
- **连字符模式**: `Vue学习笔记 - 响应式原理`

### "关于我"页面

在您的项目根目录创建一个 `about.md` 文件，并写入您的个人介绍。脚本会自动拉取其内容并渲染到 `/about` 页面。如果此文件不存在，"关于我"的导航链接会自动隐藏。

## 🚀 部署与自动化

### 部署到 Vercel (推荐)

1.  将您的仓库导入到 [Vercel](https://vercel.com)。
2.  在 Vercel 的项目设置中，配置好上文提到的**环境变量**。
3.  **重要**: 在 "Build & Development Settings" 中，将 **Build Command** 修改为 `pnpm fetch && pnpm build`。您可能还需要在这里指定 Node.js 版本为 22。
4.  点击部署，Vercel 会自动完成所有工作。

### 部署到 GitHub Pages

如果您希望使用 GitHub Pages 来托管博客：

1.  **自动路径配置**: 项目会自动检测 GitHub 环境并设置正确的 `basePath`。对于仓库名为 `username.github.io` 的情况，不会设置 `basePath`；对于其他仓库（如 `my-blog`），会自动设置 `basePath` 为 `/my-blog`。

2.  **手动配置** (可选): 如果需要自定义路径，可以设置 `NEXT_PUBLIC_BASE_PATH` 环境变量。

3.  **构建脚本**: 确保您的 GitHub Action 或构建脚本包含：
    ```bash
    pnpm fetch && pnpm build
    ```

### 使用 GitHub Action 自动更新

为了让博客在您更新 Issue 后自动同步内容，您可以配置一个 GitHub Action。

1.  **Vercel 配置**:
    - 在 Vercel 的项目设置中，进入 **Settings -> Git**。找到 **Deploy Hooks**，创建一个新的 Hook。记下这个 Hook 的 URL。
2.  **GitHub 配置**:

    - 在您的 GitHub 仓库中，进入 **Settings -> Secrets and variables -> Actions**。
    - 创建一个新的 Repository secret，命名为 `VERCEL_DEPLOY_HOOK`，值为您刚才复制的 Vercel Hook URL。
    - 再创建一个名为 `GITHUB_TOKEN` 的 secret，值为您的 GitHub Personal Access Token。

3.  **启用 Workflow**:
    - 项目中已经为您准备好了 `.github/workflows/main.yml` 文件。当您的 Issues 有任何变动（创建、编辑、关闭等）时，这个 Action 会被触发。
    - 它会自动运行 `pnpm fetch` 拉取最新数据，然后调用 Vercel 的 Deploy Hook 来触发一次新的部署。

```yaml
# .github/workflows/main.yml
name: Trigger Vercel Deploy
on:
  issues:
    types:
      [
        opened,
        edited,
        deleted,
        transferred,
        pinned,
        unpinned,
        closed,
        reopened,
        assigned,
        unassigned,
        labeled,
        unlabeled,
        locked,
        unlocked,
        milestoned,
        demilestoned,
      ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: "Checkout"
        uses: actions/checkout@v3

      - name: "Install pnpm"
        uses: pnpm/action-setup@v3
        with:
          version: 10

      - name: "Setup Node.js"
        uses: actions/setup-node@v3
        with:
          node-version: "22"
          cache: "pnpm"

      - name: "Install Dependencies"
        run: pnpm install

      - name: "Fetch Blog Data"
        run: pnpm fetch
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NEXT_PUBLIC_GITHUB_REPOSITORY: ${{ github.repository }}

      - name: "Trigger Vercel Deploy Hook"
        run: curl -X POST "${{ secrets.VERCEL_DEPLOY_HOOK }}"
```

## 🤝 贡献

欢迎通过提交 Issues 和 Pull Requests 来为这个项目做出贡献。

## 📄 许可证

本项目基于 [MIT License](LICENSE) 授权。
