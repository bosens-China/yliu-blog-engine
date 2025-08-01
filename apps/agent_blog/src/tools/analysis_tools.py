# 生成文章SEO信息和摘要

from typing import cast
from pydantic import BaseModel, Field
from apps.agent_blog.src.core.constants import MAX_TOKEN
from apps.agent_blog.src.schemas import ArticleInput
from apps.agent_blog.src.server import llm, mcp
import json


# SEO信息输出结构
class ArticleSeo(BaseModel):
    title: str = Field(description="文章标题")
    description: str = Field(description="文章描述")
    keywords: list[str] = Field(description="文章关键词")


class ArticleSeoInfo(BaseModel):
    id: int = Field(description="文章id")
    seo: ArticleSeo = Field(description="SEO信息")
    summary: str = Field(description="文章摘要")


# 数组形式的SEO信息
class ArticleSeoInfoList(BaseModel):
    articles: list[ArticleSeoInfo] = Field(description="文章seo信息列表")


# 生成文章SEO信息
@mcp.tool()
def generate_article_seo_info(
    articles: list[list[ArticleInput]],
) -> dict[int, ArticleSeoInfo]:
    """根据传递进来的文章数组串行生成SEO信息"""
    structured_llm = llm.with_structured_output(ArticleSeoInfoList)
    result_dict: dict[int, ArticleSeoInfo] = {}

    for article in articles:
        prompt = f"""
# 角色
你是一位效率极高的SEO专家团队和专业的技术内容编辑团队。你的任务是并行处理一批文章，为每一篇文章都独立生成精准的元数据和摘要。

# 任务
根据下方以JSON数组格式提供的文章列表（包含`id`, `title`, 和 `content`），为**列表中的每一篇文章**生成独立的分析结果。最终，你需要返回一个包含所有分析结果的JSON对象。

# 工作流程
1.  **遍历输入**: 迭代处理输入JSON数组中的每一个文章对象。
2.  **逐一分析**: 对每一篇文章，独立执行以下所有分析步骤：
    a.  **深度阅读**: 理解该文章的核心论点、关键技术和结论。
    b.  **生成SEO标题**: 创作一个吸引人且利于搜索的标题（最多50个字符）。
    c.  **生成SEO描述**: 撰写一段引人点击的元描述（150字符左右）。
    d.  **生成SEO关键词**: 提取3-5个最核心、最相关的关键词，组成一个列表。
    e.  **生成文章摘要**: 撰写一段更详细的、独立的摘要（约150-200字），概括文章全貌。
3.  **汇总输出**: 将所有文章的分析结果收集起来，放入一个名为 "articles" 的数组中。

# 限制与要求
- **严格遵守**最终输出的JSON格式，你的最终输出必须是一个单一的JSON对象，其内部包含一个名为 "articles" 的数组。
- 每一篇文章的分析都必须是独立的，并且要忠于其原文的核心思想。
- 所有关于长度的限制（如SEO标题和描述）必须被严格遵守。

# 待处理的文章批次 (JSON格式)
{json.dumps(article)}
    """
        result = cast(ArticleSeoInfoList, structured_llm.invoke(prompt))
        for item in result.articles:
            result_dict[item.id] = item

    return result_dict


# 对超长文本进行摘要和seo生成,list[ArticleInput]
@mcp.tool()
def generate_article_seo_info_from_long_text(
    articles: list[ArticleInput],
) -> dict[int, ArticleSeoInfo]:
    """根据传递进来的文章数组串行生成SEO信息"""
    structured_llm = llm.with_structured_output(ArticleSeoInfoList)
    result_dict: dict[int, ArticleSeoInfo] = {}

    for article in articles:
        prompt = f"""
# 角色
你是一位顶级的SEO专家和技术内容编辑。你尤其擅长处理和分析长篇文档的**片段（segments）**，并能从不完整的信息中提取出核心价值。

# 核心任务
根据下方提供的**单篇文章片段**（包含`id`, `title`, `content`），为其生成精准的SEO元数据和一段摘要。

# 重要背景：内容的不完整性
- 你收到的 `content` 只是一个更长篇文章的**一部分（一个片段）**，它可能在任何地方被截断。
- 你的所有分析都必须**严格基于当前提供的内容**。不要猜测或假设文章的其余部分会讲什么。
- 你的目标是从这个片段中提炼出最有价值的信息，而不是为整篇文章（你并未完全看到）下结论。

# 工作流程
1.  **理解片段**: 深入阅读提供的文章片段，理解其在上下文中的核心论点和关键信息。
2.  **生成分析**: 基于你对该片段的理解，完成以下分析：
    a.  **生成SEO标题**: 创作一个能概括此片段核心内容、吸引人的标题（最多50个字符）。
    b.  **生成SEO描述**: 撰写一段引人点击的元描述，总结此片段的要点（150字符左右）。
    c.  **生成SEO关键词**: 提取3-5个与此片段内容最相关的关键词，组成一个列表。
    d.  **生成片段摘要**: 撰写一段独立的摘要（约150-200字），概括**当前片段**的核心内容。

# 输出格式
- **严格遵守**最终输出的JSON格式。
- 你的最终输出必须是一个**单一的JSON对象**，直接包含分析结果，而不是嵌套在 "articles" 数组中。

## 示例输出格式:
```json
{{
  "id": "文章的ID",
  "seo_title": "生成的SEO标题",
  "seo_description": "生成的SEO描述",
  "seo_keywords": ["关键词1", "关键词2", "关键词3"],
  "summary": "生成的片段摘要"
}}

# 待处理的文章片段
{json.dumps(article)[: MAX_TOKEN - 4000 - 500]}
        """
        result = cast(ArticleSeoInfo, structured_llm.invoke(prompt))
        result_dict[article.id] = result

    return result_dict
