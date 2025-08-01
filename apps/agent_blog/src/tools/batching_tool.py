# 文章分组

from pydantic import BaseModel, Field
from apps.agent_blog.src.core.constants import MAX_TOKEN
from apps.agent_blog.src.core.token_utils import count_tokens
from apps.agent_blog.src.schemas import ArticleInput
from apps.agent_blog.src.server import mcp
import json


def count_article_tokens(article: ArticleInput) -> int:
    """计算 ArticleInput 对象的 token 数量"""
    article_json = json.dumps(article.model_dump(), ensure_ascii=False)
    return count_tokens(article_json)


class BatchingOutput(BaseModel):
    articles: list[list[ArticleInput]] = Field(description="分组后的文章列表")
    more_token_articles: list[ArticleInput] = Field(description="单篇超出的文章列表")


@mcp.tool()
def batching_tool(articles: list[ArticleInput]) -> BatchingOutput:
    """
    任务切分：将文章列表进行批处理分组。
    规则：
    1. 后续步骤需要为每篇文章生成SEO与简介，预估每篇文章有 4000 token的思考成本和 500 token的生成成本。
    2. 单个批次的总Token（包含所有文章内容、所有文章的固定开销）不能超过 MAX_TOKEN。
    3. 如果单篇文章加上其固定开销就已超限，则将其单独列出。
    4. 对剩余文章进行贪心算法分组，以最大化每个批次的利用率。
    """
    OVERHEAD_PER_ARTICLE = 4000 + 500

    # 1. 排序
    sorted_articles = sorted(articles, key=count_article_tokens)

    # 2. 识别单篇超长文章
    more_token_articles: list[ArticleInput] = []
    less_token_articles: list[ArticleInput] = []
    for art in sorted_articles:
        if count_article_tokens(art) + OVERHEAD_PER_ARTICLE > MAX_TOKEN:
            more_token_articles.append(art)
        else:
            less_token_articles.append(art)

    # 3. 对剩余文章做贪心分组 (使用你建议的简化逻辑)
    result_list: list[list[ArticleInput]] = []
    current_group: list[ArticleInput] = []
    current_group_total_tokens = 0

    for art in less_token_articles:
        t = count_article_tokens(art)
        cost_of_new_article = t + OVERHEAD_PER_ARTICLE

        # 如果当前组的总成本 + 新文章的成本 <= MAX_TOKEN
        if current_group_total_tokens + cost_of_new_article <= MAX_TOKEN:
            # 就把新文章加入当前组
            current_group.append(art)
            # 并累加其成本到总成本中
            current_group_total_tokens += cost_of_new_article
        else:
            # 否则，当前组结束
            if current_group:
                result_list.append(current_group)

            # 用当前文章开启一个新组
            current_group = [art]
            # 新组的总成本就是这第一篇文章的成本
            current_group_total_tokens = cost_of_new_article

    # 循环结束后别忘了最后一组
    if current_group:
        result_list.append(current_group)

    return BatchingOutput(articles=result_list, more_token_articles=more_token_articles)
