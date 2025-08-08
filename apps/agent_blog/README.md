# AI 增强服务 (agent-blog)

本项目是一个独立的 FastAPI 应用，作为博客引擎的AI增强模块。它通过一个HTTP接口接收文章数据，并利用一个基于 LangChain 构建的自主代理（Agent）来执行一系列SEO优化任务。

## 核心功能

- **文章分析**: 为单篇文章生成优化的SEO标题、描述、关键词和内容摘要。
- **专栏构建**: 自动分析多篇文章之间的关联性，将其聚类成专栏（系列），并为每个专栏生成描述。
- **站点SEO**: 基于所有文章的核心内容，生成适用于整个站点的全局SEO元信息。

## 技术架构

- **Web框架**: FastAPI
- **AI 编排**: LangChain Agent (ReAct)
- **核心模型**: 通过 `langchain-openai` 对接的任意大语言模型
- **数据模型**: Pydantic

## 项目结构

```
src/
├── api/             # 处理所有与API接口相关的逻辑
│   ├── endpoints.py # FastAPI的路由定义
│   └── schemas.py   # API的请求/响应数据模型
├── core/            # 项目的核心业务逻辑和配置
│   ├── agent.py     # Agent的组装与定义
│   ├── config.py    # 应用配置、环境变量和LLM初始化
│   └── prompts.py   # 存放所有Agent和工具的Prompt模板
├── services/        # 存放应用所需的服务，如数据存储
│   └── data_store.py# 一个临时的内存数据库，用于在请求生命周期内存储文章
└── tools/           # 供Agent调用的工具集
    ├── article_tools.py
    ├── series_tools.py
    └── site_tools.py
```

## 如何运行

1.  **安装依赖**: 在 `apps/agent_blog` 目录下运行 `uv install`。
2.  **配置环境变量**: 创建一个 `.env` 文件，并设置 `OPENAI_API_KEY` 和其他必要的密钥。
3.  **启动服务**: 从项目根目录运行以下命令：

    ```bash
    uvicorn apps.agent_blog.src.api.endpoints:app --reload
    ```

4.  **调用接口**: 服务启动后，可以通过向 `http://127.0.0.1:8000/process-articles/` 发送POST请求来触发Agent。

    请求体为一个包含文章对象的JSON数组，格式遵循 `api/schemas.py` 中的 `ArticleInput` 模型。
