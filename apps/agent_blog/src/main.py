from . import config as _  # noqa: F401
import os
from typing import List
from contextlib import asynccontextmanager
from fastapi import FastAPI
from langchain_core.runnables import RunnableConfig

# 按照规范，所有 import 语句都应该在文件顶部
from .graph.workflow import agent_app
from .models import Post, GraphState
from .services.cache import CacheManager

# 环境变量已由 config.py 加载，这里只做检查
if not os.getenv("OPENAI_API_KEY"):
    raise ValueError("必须设置 OPENAI_API_KEY 环境变量")

# 定义缓存 schema 版本
CACHE_SCHEMA_VERSION = "1.0"


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 应用启动时
    cache = await CacheManager.create(
        cache_file_path="agent_blog_cache.json",
        schema_version=CACHE_SCHEMA_VERSION,
    )
    app.state.cache = cache
    yield
    # 应用关闭时
    await app.state.cache.flush()


# --- FastAPI Application ---

app = FastAPI(
    title="Agent Blog API",
    description="使用AI对博客文章进行智能化处理的API",
    lifespan=lifespan,
)


@app.post("/process", response_model=dict)
async def process_articles(posts: List[Post]):
    """
    接收文章列表，使用AI流程处理它们，并返回增强后的数据。
    """
    # 1. 将输入的 Pydantic 对象列表转换为字典列表
    post_dicts = [post.model_dump(by_alias=True) for post in posts]

    # 2. 创建一个以 post id 为键的字典，用于初始化 GraphState
    posts_map = {post["id"]: post for post in post_dicts}

    # 3. 初始化图的状态
    initial_state: GraphState = {
        "posts": posts_map,
        "processed_posts": [],
        "columns": {},
        "final_columns": [],
        "site_seo": None,
    }

    # 4. 调用 LangGraph 应用处理，并将 cache 实例传入
    config: RunnableConfig = {"configurable": {"cache": app.state.cache}}
    final_state = None
    try:
        final_state = await agent_app.ainvoke(initial_state, config=config)
    except Exception as e:
        print(f"AI流程处理时发生错误: {e}")
        return {"error": "AI处理流程失败，请检查日志获取详细信息。"}

    print("--- AI流程处理完成 ---")

    # 5. 根据需求，构建一个只包含最终结果的精简字典
    # 过滤 articles 列表，只保留客户端需要的核心字段
    processed_articles = final_state.get("processed_posts", [])
    articles_for_client = [
        {
            "id": article.get("id"),
            "title": article.get("title"),
            "excerpt": article.get("excerpt"),
            "keywords": article.get("keywords"),
        }
        for article in processed_articles
    ]

    response_data = {
        "articles": articles_for_client,
        "columns": final_state.get("final_columns", []),
        "site_seo": final_state.get("site_seo"),
    }

    return {"message": "处理成功", "data": response_data}


@app.get("/", response_model=dict)
async def root():
    """
    API 根节点，返回一个欢迎信息。
    """
    return {"message": "欢迎来到 Agent Blog API"}
