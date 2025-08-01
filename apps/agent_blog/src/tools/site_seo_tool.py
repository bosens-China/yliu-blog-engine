# 根据文章的seo和摘要生成网站的seo和摘要

from typing import cast
from pydantic import BaseModel, Field
from apps.agent_blog.src.core.constants import MAX_TOKEN
from apps.agent_blog.src.server import llm, mcp
from apps.agent_blog.src.tools.analysis_tools import ArticleSeoInfo
import json


# 站点seo信息
class SiteSeoInfo(BaseModel):
    title: str = Field(description="网站标题")
    description: str = Field(description="网站描述")
    keywords: list[str] = Field(description="网站关键词")


@mcp.tool()
def generate_site_seo_info(
    articles: dict[int, ArticleSeoInfo],
) -> SiteSeoInfo:
    """根据传递进来的文章数组串行生成网站的seo和摘要"""
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
- 最终输出必须严格遵守下方示例的单一JSON对象格式。
## 示例输出格式
```json
{{
  "title": "生成的网站标题",
  "description": "生成的网站描述",
  "keywords": ["关键词1", "关键词2", "关键词3"]
}}
```

# 待处理的文章片段
{json.dumps(articles)[: MAX_TOKEN - 4000 - 500]}
        """
    result = cast(SiteSeoInfo, structured_llm.invoke(prompt))
    return result
