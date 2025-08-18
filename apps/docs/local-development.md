# 本地开发与主题定制

本指南专为希望在本地运行项目、修改源代码或自定义主题样式的开发者和贡献者准备。

## 环境准备

在开始之前，请确保您的开发环境中已安装以下软件：

- **Node.js**: 版本 `22.x` 或更高。
- **pnpm**: 版本 `10.x` 或更高。
- **Python**: 版本 `3.10` 或更高，并安装了 `uv` (`pip install uv`)。

## 本地启动流程

按照以下步骤，您可以在本地启动一个完整的开发环境。

### 第一步：克隆与安装

```bash
# 克隆项目到本地
git clone https://github.com/bosens-China/yliu-blog-engine.git

# 进入项目目录
cd yliu-blog-engine

# 安装所有 Node.js 依赖
pnpm install
```

### 第二步：配置并启动 AI 服务 (`agent-blog`)

AI 服务是数据处理流程的核心。您需要先将其启动。

```bash
# 进入 agent_blog 应用目录
cd apps/agent_blog

# 复制环境变量模板
# Windows
copy .env.example .env
# macOS / Linux
cp .env.example .env

# 编辑 .env 文件，填入您的 API Key
# OPENAI_API_KEY="sk-xxxxxxxxxxxxxx"
#
# [可选] 您还可以配置以下变量来调整 AI 服务的行为
# OPENAI_MODEL_NAME="qwen-plus-2025-07-28"
# OPENAI_BASE_URL="https://dashscope.aliyuncs.com/compatible-mode/v1"
# LLM_RPM_LIMIT=50 # 设置一个合适的速率限制，例如 50 RPM
# LLM_BURST_LIMIT=5 # 设置并发突发数，例如 5
#
# 注意：此 Key 来自阿里云百炼服务。
# 更多详情请参考 [AI 增强指南](../ai-enhancement.md)。

# 使用 uv 创建并激活虚拟环境，同时安装 Python 依赖
uv sync

# 启动 FastAPI 服务
uvicorn src.main:app --reload
```

服务启动后，它将在 `http://127.0.0.1:8000` 上监听请求。您可以保持这个终端窗口运行。

### 第三步：配置并生成博客数据

现在，回到项目根目录，为 `scripts` 包配置环境变量。

1.  在项目根目录 (`yliu-blog-engine/`) 下，创建一个名为 `.env` 的文件。
2.  打开 `.env` 文件，并至少添加以下变量：

    ```bash
    # [必需] 您希望作为内容来源的 GitHub 仓库
    NEXT_PUBLIC_GITHUB_REPOSITORY="your-github-username/your-repo-name"

    # [推荐] 您的 GitHub 个人访问令牌，以避免 API 速率限制
    GITHUB_TOKEN="your_personal_access_token"
    ```

3.  运行数据生成脚本。此步骤会拉取 Issues，调用正在运行的 `agent-blog` 服务进行处理，并生成最终的 `blog-data.json`。

    ```bash
    # 运行数据生成脚本
    pnpm --filter @yliu/scripts build:data
    ```

### 第四步：启动博客网站开发服务器

最后，启动 Next.js 应用的开发服务器。

```bash
# 启动 web 应用
pnpm --filter @yliu/web dev
```

服务器启动后，在浏览器中访问 `http://localhost:3000`，您就可以看到您的博客了。

## 主题与样式定制

如果您希望修改博客的视觉外观，例如颜色、字体或页面布局，可以从以下几个关键文件入手。

- **技术栈**: 前端应用基于 **Next.js App Router** 和 **Tailwind CSS v4** 构建。
- **Tailwind 配置**: `apps/web/tailwind.config.ts`
- **全局样式**: `apps/web/src/app/globals.css`
- **根布局**: `apps/web/src/app/layout.tsx`
- **组件**: `apps/web/src/components/`
