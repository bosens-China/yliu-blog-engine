"""
用于生成站点级别SEO信息的工具。
"""
from typing import cast
from langchain.tools import tool
from ..core.config import llm
from ..core.models import SiteSeoInfo, ProcessedArticleList
import json


@tool
def generate_site_seo(processed_articles: ProcessedArticleList) -> SiteSeoInfo:
    """根据所有已处理文章的SEO信息和摘要，生成整个站点的全局SEO信息。"""
    articles_summary = processed_articles.model_dump()["articles"]

    structured_llm = llm.with_structured_output(SiteSeoInfo)

    prompt = f"""
# 角色
你是一位顶级的品牌SEO策略师和首席内容官。你的专长是从大量内容中洞察核心主题，并为整个网站或知识库定义一个统一、有吸引力的品牌身份。

# 核心任务
根据下方以JSON格式提供的一系列文章的“SEO标题”、“关键词”和“摘要”，为整个网站（或首页）生成全局的SEO信息。

# 工作流程
1.  **全局分析**: 仔细阅读所有提供的文章摘要信息，不要局限于任何单篇文章。
2.  **识别核心主题**: 找出这些文章中反复出现的核心概念、主要技术栈和共同主题。
3.  **综合提炼**: 基于你对整个内容集合的理解，完成以下任务：
    a.  **生成网站标题**: 创作一个能够概括整个网站核心内容的、权威且吸引人的主标题。
    b.  **生成网站描述**: 撰写一段引人入胜的元描述，告诉用户这个网站是关于什么的，能提供什么价值。
    c.  **生成网站关键词**: 提取3-5个最高度概括性的关键词，代表网站的整体定位。

# 限制与要求
- 你的输出必须是**宏观**和**综合性**的，反映所有文章的共性，而不是某一篇的特性。
- 最终输出必须严格遵守JSON对象格式。

# 待处理的文章SEO及摘要信息:
{json.dumps(articles_summary, ensure_ascii=False)}
    """
    result = cast(SiteSeoInfo, structured_llm.invoke(prompt))
    return result
