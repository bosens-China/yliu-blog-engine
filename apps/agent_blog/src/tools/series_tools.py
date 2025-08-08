"""
用于处理专栏的工具集。
"""
from typing import cast
from langchain.tools import tool
from ..core.config import llm
from ..services.data_store import article_store
from ..core.models import (
    SeriesProposal,
    SeriesProposalsContainer,
    SeriesInfo,
    ProcessedArticle,
)
import json


@tool
def propose_series_from_articles(article_ids: list[int]) -> list[SeriesProposal]:
    """
    根据文章ID列表，分析文章标题和标签，生成专栏（系列）的初步结构提案。
    """
    articles = article_store.get_all_articles()
    articles_summary = [
        article.model_dump(include={"id", "title", "labels", "updatedAt"})
        for article in articles
    ]

    structured_llm = llm.with_structured_output(SeriesProposalsContainer)

    prompt = f"""
# 角色
你是一位顶级内容策划师，擅长从文章列表中发现内在联系，将相关内容组织成系列。

# 任务
分析以下文章列表（包含ID、标题、标签和更新时间），识别并创建专栏提案。每个专栏应包含至少2篇主题相关的文章。

# 限制
- 专栏名称要准确、简洁，不要包含多余信息。
- 同一篇文章只能归属于一个最合适的专栏。
- 每个专栏至少包含2篇文章。
- 如果找不到任何合适的专栏，返回一个空的 "columns" 数组。

# 文章列表:
{json.dumps(articles_summary, ensure_ascii=False)}
"""

    container_result = cast(SeriesProposalsContainer, structured_llm.invoke(prompt))
    return container_result.columns


@tool
def generate_series_description(
    series_proposal: SeriesProposal, processed_articles: list[ProcessedArticle]
) -> SeriesInfo:
    """
    根据单个专栏提案及其包含文章的SEO摘要信息，为该专栏生成最终的描述。
    """
    articles_in_series = [
        p_article
        for p_article in processed_articles
        if p_article.id in series_proposal.posts
    ]

    summaries_for_prompt = [
        {"title": article.seo.title, "summary": article.summary}
        for article in articles_in_series
    ]

    structured_llm = llm.with_structured_output(SeriesInfo)

    prompt = f"""
# 角色
你是一位经验丰富的专栏编辑，擅长将多篇文章的核心思想融合成一段引人入胜的专栏简介。

# 任务
为名为 '{series_proposal.name}' 的专栏撰写一段高质量的、概括性的描述。请参考以下该专栏内包含的文章列表及其摘要。

# 专栏文章列表:
{json.dumps(summaries_for_prompt, ensure_ascii=False)}
"""

    result = cast(SeriesInfo, structured_llm.invoke(prompt))
    return result