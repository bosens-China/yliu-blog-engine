# 本地开发与主题定制

本指南专为希望在本地运行项目、修改源代码或自定义主题样式的开发者和贡献者准备。

## 环境准备

在开始之前，请确保您的开发环境中已安装以下软件：

- **Node.js**: 版本 `22.x` 或更高。
- **pnpm**: 版本 `10.x` 或更高。

## 本地启动流程

按照以下步骤，您可以在本地启动一个完整的开发环境。

### 第一步：克隆与安装

```bash
# 克隆项目到本地
git clone https://github.com/bosens-China/yliu-blog-engine.git

# 进入项目目录
cd yliu-blog-engine

# 安装所有依赖
pnpm install
```

### 第二步：配置环境变量

1.  在项目的根目录下，创建一个名为 `.env` 的文件。
2.  打开 `.env` 文件，并至少添加以下两个变量：

    ```env
    # [必需] 您希望作为内容来源的 GitHub 仓库
    NEXT_PUBLIC_GITHUB_REPOSITORY=your-github-username/your-repo-name

    # [推荐] 您的 GitHub 个人访问令牌，以避免 API 速率限制
    GITHUB_TOKEN=your_personal_access_token
    ```

在本地开发时，您只需要关心这两个核心变量即可。

### 第三步：生成博客数据

此步骤会模拟 GitHub Action 的核心行为，即拉取您仓库中的 Issues，并将其处理成 Next.js 应用所需的 `blog-data.json` 文件。

```bash
# 运行数据生成脚本
pnpm --filter @yliu/scripts build:data
```

执行成功后，您会在 `apps/web/src/data/` 目录下看到生成的 `blog-data.json` 文件。

### 第四步：启动开发服务器

现在，您可以启动 Next.js 应用的开发服务器了。

```bash
# 启动 web 应用
pnpm --filter @yliu/web dev
```

服务器启动后，在浏览器中访问 [http://localhost:3000](http://localhost:3000)，您就可以看到您的博客了。

## 主题与样式定制

如果您希望修改博客的视觉外观，例如颜色、字体或页面布局，可以从以下几个关键文件入手。

- **技术栈**: 前端应用基于 **Next.js App Router** 和 **Tailwind CSS v4** 构建。

- **Tailwind 配置 (`apps/web/tailwind.config.ts`)**
  这是定义设计系统的核心文件。您可以在这里修改颜色、字体、间距等基础设计变量。

- **全局样式 (`apps/web/src/app/globals.css`)**
  您可以在此文件中添加或修改全局的 CSS 样式。

- **根布局 (`apps/web/src/app/layout.tsx`)**
  这个文件定义了所有页面共享的根布局，例如页面的 HTML 结构、全局字体加载等。如果您想修改所有页面的通用布局（例如添加一个全局的 Banner），可以从这里开始。

- **组件 (`apps/web/src/components/`)**
  大部分 UI 元素，如文章卡片、按钮、标签等，都被封装成了独立的 React 组件。您可以直接修改这些组件来实现更细粒度的样式调整。
