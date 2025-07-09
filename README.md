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
- 🌙 **精致深色模式**: 参考 Cursor 设计的现代深色主题，采用渐变背景和低对比度卡片设计，提供沉浸式阅读体验。
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

### 方式一：GitHub Action 一键部署（推荐）

最简单的方式是使用我们提供的 GitHub Action，只需要在你的仓库中添加一个 workflow 文件即可自动部署博客。

#### 1. 准备你的仓库

创建一个新的 GitHub 仓库，用于存放你的博客内容（Issues）。

#### 2. 配置 GitHub Action

在你的仓库中创建 `.github/workflows/deploy-blog.yml` 文件：

```yaml
name: Deploy Blog

on:
  # 手动触发
  workflow_dispatch:
  # Issues 变化时自动触发
  issues:
    types: [opened, edited, closed, reopened, labeled, unlabeled]
  # 定时更新（每天 6 点）
  schedule:
    - cron: "0 6 * * *"

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write
    steps:
      - name: 部署博客
        uses: yliu/blog-engine@v1
        with:
          # 基础配置
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} # 推荐使用，避免 API 限流

          # 可选配置
          NEXT_PUBLIC_BLOG_TITLE: "我的技术博客"
          NEXT_PUBLIC_FOOTER_TEXT: "© 2024 by 小🐑"
```

#### 3. 开始写作

- 在你的仓库中创建 Issues 作为博客文章
- 使用 Labels 来分类文章
- 创建 `about.md` 文件作为个人介绍页面

#### 4. 自动部署

提交 workflow 文件后，GitHub Action 会自动：

- 读取你的 Issues 作为文章内容
- 生成静态博客网站
- 部署到 GitHub Pages

### 方式二：本地开发部署

如果你想本地开发或自定义部署，可以克隆项目进行开发：

#### 1. 环境准备

- Node.js 22+
- pnpm 10+

#### 2. 克隆项目

```bash
git clone https://github.com/yliu/blog-engine.git
cd blog-engine
pnpm install
```

#### 3. 配置环境变量

创建 `.env.local` 文件：

```bash
# 基础配置
NEXT_PUBLIC_GITHUB_REPOSITORY=yourname/your-repo
# 推荐配置 (为了避免 API 限流)
GITHUB_TOKEN=your_github_token

# 可选配置
NEXT_PUBLIC_BLOG_TITLE=我的技术博客
NEXT_PUBLIC_FOOTER_TEXT=© 2024 by 我的名字
```

#### 4. 本地开发

```bash
# 拉取文章数据
pnpm dev:data

# 启动开发服务器
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看你的博客。

#### 5. 构建部署

```bash
# 构建静态文件
pnpm build

# 静态文件输出到 out/ 目录
```

## ⚙️ 配置选项

您可以通过两种方式配置博客：

1.  **GitHub Action**: 在您的 `.github/workflows/deploy-blog.yml` 文件中，使用 `with` 关键字传入参数。这是推荐的自动化部署方式。
2.  **本地开发**: 在项目根目录下创建一个 `.env.local` 文件，并写入环境变量。

下表列出了所有可用的配置选项及其对应的环境变量名称。

| 环境变量                        | 说明                                       | Action 必填 | 默认值                                     |
| ------------------------------- | ------------------------------------------ | ----------- | ------------------------------------------ |
| `GITHUB_TOKEN`                  | GitHub 访问令牌（推荐，避免 API 限流）     | 否          | (匿名访问)                                 |
| `NEXT_PUBLIC_GITHUB_REPOSITORY` | GitHub 仓库地址, 格式：`owner/repo`        | 否          | `${{ github.repository }}` (当前仓库)      |
| `NEXT_PUBLIC_BLOG_TITLE`        | 博客标题                                   | 否          | `${{ github.repository_owner }}的个人博客` |
| `NEXT_PUBLIC_FOOTER_TEXT`       | 页脚文本                                   | 否          | ""                                         |
| `NEXT_PUBLIC_BASE_PATH`         | 站点基础路径                               | 否          | ""                                         |
| `NEXT_PUBLIC_HEADER_CONFIG`     | Header 菜单配置 (JSON 字符串)              | 否          | (自动生成)                                 |
| `COLUMN_MIN_PREFIX_LENGTH`      | 自动识别专栏所需的最短公共前缀长度         | 否          | `6`                                        |
| `AI_SITE_API_KEY`               | 用于站点分析的 AI 服务 API Key             | 否          | ""                                         |
| `AI_SITE_WORKFLOW_URL`          | 用于站点分析的 AI 服务工作流 URL           | 否          | ""                                         |
| `AI_POSTS_API_KEY`              | 用于文章增强的 AI 服务 API Key             | 否          | ""                                         |
| `AI_POSTS_WORKFLOW_URL`         | 用于文章增强的 AI 服务工作流 URL           | 否          | ""                                         |
| `AI_USER_ID`                    | 调用 AI 服务的用户标识符                   | 否          | `${{ github.actor }}` (当前用户)           |
| `NEXT_PUBLIC_SITE_URL`          | 站点 URL (例如 `https://blog.example.com`) | 否          | (自动推断)                                 |
| `NEXT_PUBLIC_BLOG_AUTHOR`       | 作者名称                                   | 否          | (仓库所有者)                               |
| `NEXT_PUBLIC_SEO_DESCRIPTION`   | 用于 SEO 的站点描述                        | 否          | (AI 生成或仓库描述)                        |
| `NEXT_PUBLIC_SEO_KEYWORDS`      | 用于 SEO 的关键词 (逗号分隔)               | 否          | (AI 生成)                                  |

## 🔧 最佳实践配置

### 基础配置示例

本 Action 可实现真正的“零配置”，无需任何参数即可运行。但为避免 GitHub API 限流，强烈推荐您提供 `GITHUB_TOKEN`。

```yaml
# .github/workflows/deploy-blog.yml
name: Deploy Blog

on:
  workflow_dispatch:
  issues:
    types: [opened, edited, closed, reopened, labeled, unlabeled]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write
    steps:
      - name: 部署博客
        uses: yliu/blog-engine@v1
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NEXT_PUBLIC_BLOG_TITLE: "我的技术博客"
```

### AI 增强配置示例

如果您拥有 Dify 服务，可以开启 AI 增强功能，通过一个统一的工作流自动生成站点和文章的 SEO 信息、提取专栏等。

```yaml
# .github/workflows/deploy-blog.yml
name: Deploy Blog with AI

on:
  workflow_dispatch:
  issues:
    types: [opened, edited, closed, reopened, labeled, unlabeled]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write
    steps:
      - name: 部署博客
        uses: yliu/blog-engine@v1
        with:
          # 基础配置
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

          # AI 增强配置 (以 Dify 为例)
          AI_SITE_API_KEY: ${{ secrets.AI_SITE_API_KEY }}
          AI_SITE_WORKFLOW_URL: "https://api.dify.ai/v1/workflows/your_site_workflow_id/run"
          AI_POSTS_API_KEY: ${{ secrets.AI_POSTS_API_KEY }} # 如果与站点 Key 相同，可复用
          AI_POSTS_WORKFLOW_URL: "https://api.dify.ai/v1/workflows/your_posts_workflow_id/run"
```

### 高级配置示例

包含自定义菜单、定时更新等高级功能：

```yaml
# .github/workflows/deploy-blog.yml
name: Deploy Blog

on:
  workflow_dispatch:
  issues:
    types: [opened, edited, closed, reopened, labeled, unlabeled]
  schedule:
    - cron: "0 6 * * *" # 每天早上 6 点自动更新

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: 部署博客
        uses: yliu/blog-engine@v1
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NEXT_PUBLIC_BLOG_TITLE: "我的技术博客"
          NEXT_PUBLIC_FOOTER_TEXT: "© 2024 技术分享 | 保持学习"
          NEXT_PUBLIC_HEADER_CONFIG: |
            {
              "items": [
                { "type": "builtin", "text": "首页", "builtin": "latest" },
                { "type": "label", "text": "前端技术", "label": "前端" },
                { "type": "label", "text": "后端开发", "label": "后端" },
                { "type": "builtin", "text": "所有分类", "builtin": "categories" },
                { "type": "builtin", "text": "关于我", "builtin": "about" }
              ]
            }
```

## 📖 文章写作

- **创建文章**: 在您的 GitHub 仓库中创建一个新的 Issue。
- **文章标题**: Issue 的标题就是文章的标题。
- **文章内容**: Issue 的正文就是文章内容，支持所有 Markdown 语法。
- **文章分类**: 为 Issue 添加 Label，它们会自动成为文章的分类。
- **发布文章**: 保持 Issue 为 `open` 状态。如果想隐藏文章，只需 `close` 该 Issue。
- **更新文章**: 修改 Issue 内容后，重新运行 `pnpm dev:data` 即可同步。
- **文章摘要**: 默认截取正文前 200 个字符。若想自定义摘要，可在文中插入 `<!-- more -->` 分隔符，标记之前的内容即为摘要。

### 专栏文章

如果想将一系列文章组织成一个"专栏"，只需在标题中遵循特定格式。系统会自动识别以下模式：

- **"之"模式**: `深入JavaScript之this绑定`
- **序号模式**: `React源码解析（一）`
- **连字符模式**: `Vue学习笔记 - 响应式原理`

### "关于我"页面

在您的项目根目录创建一个 `about.md` 文件，并写入您的个人介绍。脚本会自动拉取其内容并渲染到 `/about` 页面。如果此文件不存在，"关于我"的导航链接会自动隐藏。

## 🎛️ 高级配置

### 自定义 Header 菜单

通过 `NEXT_PUBLIC_HEADER_CONFIG` 环境变量可以完全自定义导航菜单：

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

**菜单项类型**：

- `builtin`: 内置页面（`latest`、`categories`、`columns`、`about`）
- `label`: 特定标签页面，点击跳转到 `/category/标签名`

### 条件部署

只在特定条件下触发部署：

```yaml
on:
  issues:
    types: [opened, edited, closed, reopened]
    # 只有带有 'blog' 标签的 Issues 变化才触发部署
  workflow_dispatch:
    inputs:
      force_deploy:
        description: "强制部署"
        required: false
        default: false
        type: boolean

jobs:
  deploy:
    runs-on: ubuntu-latest
    if: contains(github.event.issue.labels.*.name, 'blog') || github.event_name == 'workflow_dispatch'
    # ... 其他配置
```

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

## 📚 使用示例

### 个人技术博客

```yaml
name: 个人技术博客

on:
  workflow_dispatch:
  issues:
    types: [opened, edited, closed, reopened, labeled, unlabeled]
  schedule:
    - cron: "0 8 * * *" # 每天早上 8 点更新

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write
    steps:
      - name: 部署技术博客
        uses: yliu/blog-engine@v1
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NEXT_PUBLIC_BLOG_TITLE: "小 🐑 的技术博客"
          NEXT_PUBLIC_FOOTER_TEXT: "© 2024 专注于前端技术分享"
          NEXT_PUBLIC_HEADER_CONFIG: |
            {
              "items": [
                { "type": "builtin", "text": "最新文章", "builtin": "latest" },
                { "type": "label", "text": "JavaScript", "label": "JavaScript" },
                { "type": "label", "text": "React", "label": "React" },
                { "type": "label", "text": "Vue", "label": "Vue" },
                { "type": "builtin", "text": "所有分类", "builtin": "categories" },
                { "type": "builtin", "text": "关于我", "builtin": "about" }
              ]
            }
```

### 团队技术文档

```yaml
name: 团队技术文档

on:
  workflow_dispatch:
  issues:
    types: [opened, edited, closed, reopened]
    # 只处理标记为 'tech-doc' 的 Issues

jobs:
  deploy:
    runs-on: ubuntu-latest
    if: contains(github.event.issue.labels.*.name, 'tech-doc') || github.event_name == 'workflow_dispatch'
    steps:
      - name: 部署团队文档
        uses: yliu/blog-engine@v1
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NEXT_PUBLIC_BLOG_TITLE: "团队技术文档"
          NEXT_PUBLIC_HEADER_CONFIG: |
            {
              "items": [
                { "type": "label", "text": "架构设计", "label": "架构" },
                { "type": "label", "text": "开发规范", "label": "规范" },
                { "type": "label", "text": "最佳实践", "label": "实践" },
                { "type": "builtin", "text": "所有文档", "builtin": "categories" }
              ]
            }
```

## 🤝 贡献

欢迎通过提交 Issues 和 Pull Requests 来为这个项目做出贡献。

## 📄 许可证

本项目基于 [MIT License](LICENSE) 授权。

## 🛠️ 自定义开发

如果你想基于此项目进行二次开发：

```bash
# 克隆项目
git clone https://github.com/yliu/blog-engine.git
cd blog-engine

# 安装依赖
pnpm install

# 本地开发
pnpm dev
```

Action 使用 TypeScript 编写，支持：

- 完整的类型检查
- 自动化测试
- 代码格式化
- 持续集成
