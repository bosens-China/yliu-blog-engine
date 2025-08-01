# 专栏工具，用于生成专栏的结构和描述

from typing import cast
from pydantic import BaseModel, Field
from ..schemas import ArticleInput
from ..server import llm, mcp
from ..core.constants import MAX_TOKEN
from ..core.token_utils import count_tokens


class ColumnProposal(BaseModel):
    """一个基于标题分析得出的初步专栏结构。"""

    id: int = Field(description="专栏的id，由ai系统生成，主要不重复即可")
    name: str = Field(description="根据文章标题提取的专栏名称")
    posts: list[int] = Field(description="属于该专栏的所有文章的ID列表")
    count: int = Field(description="专栏包含的文章数量")
    lastUpdated: str = Field(
        description="专栏的最后更新时间，格式为YYYY-MM-DD HH:MM:SS"
    )


class ColumnProposalsContainer(BaseModel):
    """一个用于存放专栏提案列表的容器。"""

    columns: list[ColumnProposal]


class ColumnDescription(BaseModel):
    """一个专栏的最终描述。"""

    description: str = Field(
        description="基于多篇文章简介生成的、对专栏的最终概括性描述，字数不要超过100字"
    )


@mcp.tool()
def propose_columns_from_titles(articles: list[ArticleInput]) -> list[ColumnProposal]:
    """
    第一步：根据文章标题列表，提议专栏结构。
    这个工具只负责将文章分组，不生成详细描述，因此速度快且不会超出Token限制。
    """

    structured_llm = llm.with_structured_output(ColumnProposalsContainer)

    formatted_titles = "\n".join(
        [f"ID: {article.id}, Title: {article.title}" for article in articles]
    )

    prompt = f"""
# 角色
你是一位顶级内容策划师，擅长从文章标题列表中发现内在联系，将相关内容组织成系列。

# 任务
分析以下文章列表，识别并创建专栏提案。每个专栏应包含至少2篇主题相关的文章。
你的输出只需包含专栏的建议名称和对应的文章ID列表。

# 限制
- 专栏名称要准确，不要包含多余信息。
- 同一篇文章只能归属于一个最合适的专栏，此外每一个专栏至少包含2篇文章。
- 如果找不到任何合适的专栏，返回一个空的 "columns" 数组。

# 文章列表:
{formatted_titles}
"""

    container_result = cast(ColumnProposalsContainer, structured_llm.invoke(prompt))

    return container_result.columns


@mcp.tool()
def generate_column_description(summaries: list[str]) -> str:
    """
    第二步：根据一个专栏的所有文章简介，为其生成一个最终的、高质量的描述。
    此工具内置了Token管理策略，以处理可能包含大量简介的情况。
    """

    structured_llm = llm.with_structured_output(ColumnDescription)

    # --- 内置的智能Token管理策略 ---
    summaries_for_prompt: list[str] = []
    current_token_count = 0
    # 预留思考和输出的token
    INPUT_TOKEN_BUDGET = MAX_TOKEN - 20000

    # 按简介长度从小到大排序，优先保留简短但可能核心的信息
    sorted_summaries = sorted(summaries, key=count_tokens)

    for summary in sorted_summaries:
        summary_tokens = count_tokens(summary)
        if current_token_count + summary_tokens > INPUT_TOKEN_BUDGET:
            break
        summaries_for_prompt.append(summary)
        current_token_count += summary_tokens

    prompt = f"""
# 角色
你是一位经验丰富的专栏编辑，擅长将多篇文章的核心思想融合成一段引人入胜的专栏简介。

# 任务
请根据以下提供的一系列文章简介，为它们所属的专栏撰写一段高质量的、概括性的描述。
请注意：由于内容限制，可能只提供了一部分简介。

# 文章简介集合:
{"\n\n---\n\n".join(summaries_for_prompt)}
"""

    result = cast(ColumnDescription, structured_llm.invoke(prompt))

    return result.description
