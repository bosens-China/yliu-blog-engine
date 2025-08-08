"""
用于处理单篇文章的工具集。
"""
from langchain.tools import tool
from ..core.config import llm
from ..services.data_store import article_store
from ..core.models import ProcessedArticle, ProcessedArticleList
import asyncio
import json
from typing import cast


@tool
async def process_articles(article_ids: list[int]) -> ProcessedArticleList:
    """接收一个文章ID列表，为每篇文章生成SEO信息和摘要，并返回一个包含所有结果的列表。"""
    # 这里我们指定输出模型，LangChain会尝试将LLM的输出解析为ProcessedArticle
    structured_llm = llm.with_structured_output(ProcessedArticle)

    async def _process_single_article(article_id: int) -> ProcessedArticle | None:
        article = article_store.get_by_id(article_id)
        if not article:
            return None

        prompt = f"""# TOOL_NAMESPACE: article_processor

# 角色
你是一位效率极高的SEO专家和专业技术内容编辑。

# 任务
根据以下文章内容，为其生成精准的元数据和摘要。

# 工作流程
1. **深度阅读**: 理解文章的核心论点、关键技术和结论。
2. **生成SEO标题**: 创作一个吸引人且利于搜索的标题（最多50个字符）。
3. **生成SEO描述**: 撰写一段引人点击的元描述（150字符左右）。
4. **生成SEO关键词**: 提取3-5个最核心、最相关的关键词，组成一个列表。
5. **生成文章摘要**: 撰写一段详细的摘要（约150-200字），概括文章全貌。
6. **返回分析结果**: 将所有分析结果组织为JSON格式并返回。

# 限制与要求
- 严格遵守JSON输出格式。
- 所有关于长度的限制必须被严格遵守。

# 待处理的文章
{json.dumps(article.model_dump(), ensure_ascii=False)}
        """
        # ainvoke返回的是一个字典或Pydantic模型，我们使用cast来明确告知类型检查器
        result = await structured_llm.ainvoke(prompt)
        return cast(ProcessedArticle, result)

    tasks = [_process_single_article(article_id) for article_id in article_ids]
    processed_results = await asyncio.gather(*tasks)

    # 过滤掉None的结果，现在列表中的元素类型是明确的 ProcessedArticle | None
    successful_results: list[ProcessedArticle] = [
        res for res in processed_results if res is not None
    ]

    # 此时 successful_results 的类型是 list[ProcessedArticle]，与Pydantic模型兼容
    return ProcessedArticleList(articles=successful_results)