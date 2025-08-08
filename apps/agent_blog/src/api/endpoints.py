"""
定义 FastAPI 应用的 API 端点。
"""

import logging
from fastapi import FastAPI, HTTPException
from ..core.models import ArticleInput
from ..services.data_store import article_store
from ..core.agent import get_seo_agent_executor

logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Blog Agent API",
    description="一个用于触发博客SEO优化Agent的API服务。",
    version="1.0.0",
)


@app.post("/process-articles/", tags=["SEO Agent"])
async def process_articles_endpoint(articles: list[ArticleInput]):
    """
    接收文章列表，触发一个完整的SEO优化流程，并返回Agent的原始输出。
    """
    if not articles:
        logger.warning("接收到空的文章列表请求。")
        raise HTTPException(status_code=400, detail="文章列表不能为空。")

    logger.info(f"接收到 {len(articles)} 篇文章的处理请求。")

    # 1. 将传入的数据加载到内存存储中
    article_store.load(articles)
    logger.info("数据已加载到内存存储。")

    # 2. 准备 Agent 的输入
    article_ids = [article.id for article in articles]
    agent_input = {"input": f"请为以下文章ID列表执行完整的SEO优化流程: {article_ids}"}
    logger.info(f"准备调用Agent，处理ID: {article_ids}")

    # 3. 获取并运行 Agent 执行器
    try:
        agent_executor = get_seo_agent_executor()
        result = await agent_executor.ainvoke(agent_input)
        logger.info("Agent执行成功。")
    except Exception as e:
        logger.error(f"Agent执行期间发生严重错误: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Agent执行出错: {e}")

    # 4. 直接返回 Agent 的原始输出，用于调试和观察
    output = result.get("output", "")
    logger.info("成功返回原始处理结果。")
    return {"status": "success", "result": output}
