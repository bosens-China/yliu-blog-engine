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

## 📁 页面结构

博客系统包含以下核心页面：

### 主要页面

| 路由           | 文件位置                       | 功能说明                           |
| -------------- | ------------------------------ | ---------------------------------- |
| `/`            | `src/app/page.tsx`             | 首页重定向到 `/page/1`             |
| `/page/[page]` | `src/app/page/[page]/page.tsx` | 文章列表页面，支持分页浏览所有文章 |
| `/post/[id]`   | `src/app/post/[id]/page.tsx`   | 文章详情页面，显示完整的文章内容   |
| `/about`       | `src/app/about/page.tsx`       | 关于页面，展示 `about.md` 的内容   |

### 分类和专栏

| 路由               | 文件位置                           | 功能说明                             |
| ------------------ | ---------------------------------- | ------------------------------------ |
| `/categories`      | `src/app/categories/page.tsx`      | 分类列表页面，展示所有 GitHub Labels |
| `/category/[name]` | `src/app/category/[name]/page.tsx` | 特定分类页面，展示该标签下的所有文章 |
| `/columns`         | `src/app/columns/page.tsx`         | 专栏列表页面，展示所有专栏系列       |
| `/column/[name]`   | `src/app/column/[name]/page.tsx`   | 特定专栏页面，展示该专栏下的所有文章 |

### 特殊页面

| 路由    | 文件位置                | 功能说明                               |
| ------- | ----------------------- | -------------------------------------- |
| `/page` | `src/app/page/page.tsx` | 分页根路径重定向到 `/page/1`           |
| `/*`    | `src/app/not-found.tsx` | 404 错误页面                           |
| -       | `src/app/layout.tsx`    | 根布局，包含 Header、Footer 和全局样式 |

### 页面特性

- **🔄 自动重定向**：根路径和分页根路径自动重定向到第一页
- **📱 响应式设计**：所有页面都完美适配移动端和桌面端
- **🚀 静态生成**：支持 SSG，构建时预生成所有页面，SEO 友好
- **🔍 智能路由**：根据内容自动生成静态参数，避免 404 错误
- **🎨 统一样式**：所有页面使用统一的设计系统和组件

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

| 变量名                           | 说明                                          | 必填 | 示例                           |
| -------------------------------- | --------------------------------------------- | ---- | ------------------------------ |
| `GITHUB_TOKEN`                   | GitHub 访问令牌 (推荐，可避免 API 限流)       | 否   | `ghp_xxxx...`                  |
| `NEXT_PUBLIC_GITHUB_REPOSITORY`  | 你的 GitHub 仓库地址 (例如 `owner/repo`)      | 是   | `yourname/your-repo`           |
| `NEXT_PUBLIC_BLOG_TITLE`         | 博客标题 (可选, 默认为 "{仓库拥有者}的博客")  | 否   | `我的技术博客`                 |
| `NEXT_PUBLIC_FOOTER_TEXT`        | 博客页脚显示的文本 (可选)                     | 否   | `© 2024 by 小🐑`               |
| `NEXT_PUBLIC_BASE_PATH`          | 站点基础路径 (可选，GitHub Pages 自动解析)    | 否   | `/my-blog`                     |
| `NEXT_PUBLIC_ICON_URL`           | 网站图标 URL (可选，自动从仓库或默认图标获取) | 否   | `https://example.com/icon.png` |
| `NEXT_PUBLIC_HEADER_MENU_CONFIG` | Header 菜单配置 (可选，支持自定义菜单顺序)    | 否   | 见下方菜单配置示例             |

> **提示**: `GITHUB_TOKEN` 对于公开仓库是可选的，但为了防止达到 GitHub API 的速率限制，强烈建议创建一个。您可以从 [GitHub Developer Settings](https://github.com/settings/tokens/new?scopes=repo) 获取，只需勾选 `repo` 权限即可。

#### Header 菜单配置示例

`NEXT_PUBLIC_HEADER_MENU_CONFIG` 允许您自定义 Header 菜单的内容和顺序。如果不设置此变量，系统会使用默认菜单配置。

**默认配置**：

```json
{
  "items": [
    { "type": "builtin", "text": "最新文章", "builtin": "latest" },
    { "type": "builtin", "text": "分类", "builtin": "categories" },
    { "type": "builtin", "text": "专栏", "builtin": "columns" },
    { "type": "builtin", "text": "关于我", "builtin": "about" }
  ]
}
```

**自定义配置示例**：

```json
{
  "items": [
    { "type": "builtin", "text": "首页", "builtin": "latest" },
    { "type": "label", "text": "技术分享", "label": "技术" },
    { "type": "label", "text": "人生感悟", "label": "感悟" },
    { "type": "builtin", "text": "所有分类", "builtin": "categories" },
    { "type": "builtin", "text": "关于", "builtin": "about" }
  ]
}
```

**菜单项类型说明**：

- **内置菜单** (`type: "builtin"`):

  - `latest`: 最新文章页面
  - `categories`: 分类页面
  - `columns`: 专栏页面
  - `about`: 关于我页面

- **自定义标签菜单** (`type: "label"`):
  - `text`: 显示的菜单文本
  - `label`: 对应的 GitHub Label 名称
  - 点击后跳转到 `/category/标签名` 页面

**智能显示控制**：

- 系统会自动检查标签是否存在，不存在的标签菜单会被隐藏
- 内置菜单根据内容存在性自动显示/隐藏（如没有专栏时隐藏专栏菜单）
- 用户可通过 `"show": false` 属性强制隐藏任何菜单项

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

## 🔄 开发和贡献

### Conventional Commits 规范

本项目使用 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/) 规范来管理版本和生成 CHANGELOG。

**提交消息格式**：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**常用类型**：

- `feat`: 新功能
- `fix`: 错误修复
- `docs`: 文档更新
- `style`: 样式调整
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `build`: 构建系统
- `ci`: CI/CD 相关
- `chore`: 其他更新

**示例**：

```bash
git commit -m "feat: 添加自定义 Header 菜单配置功能"
git commit -m "fix: 修复移动端菜单显示问题"
git commit -m "docs: 更新部署说明文档"
```

### 自动化发布流程

项目使用 [Release Please](https://github.com/googleapis/release-please-action) 实现自动化版本管理：

1. **提交代码**：使用 Conventional Commits 格式提交代码
2. **自动创建 Release PR**：Release Please 会自动创建包含版本更新和 CHANGELOG 的 PR
3. **合并 PR**：审查并合并 Release PR
4. **自动发布**：合并后自动创建 GitHub Release 和构建产物

这样您就不需要手动管理版本号和发布说明了！

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
