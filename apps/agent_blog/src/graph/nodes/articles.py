# graph/nodes/articles.py
"""
包含与文章处理相关的图节点：生成摘要和关键词。
"""

import asyncio
import hashlib
from typing import cast, Dict, Any
from langchain_core.prompts import PromptTemplate

from langchain_core.runnables import RunnableConfig

# 导入通用LLM客户端和所需模型
from ...services.llm import llm_client
from ...models import GraphState, ArticleSummary
from ...services.cache import CacheManager

# --- 此节点的专属Prompt和Chain定义 ---

SUMMARY_PROMPT = PromptTemplate.from_template(
    """
# 角色
你是一位专业的博客编辑与SEO专家，擅长洞察任何主题文章的核心价值，并优化其网络传播力。

# 任务目标
为给定的文章生成一段引人入胜的摘要和一组精准的SEO关键词。

# 输出格式
请严格按照以下JSON结构输出，不要添加任何额外的解释：
```json
{{
  "excerpt": "摘要内容",
  "keywords": ["关键词1", "关键词2", "关键词3"]
}}
```

# 具体要求

## 摘要 (excerpt)
- **长度**: 50-150字。
- **内容**: 精准提炼文章的核心观点、解决的问题或提供的独特价值。
- **风格**: 语言流畅，简洁有力，能有效激发读者的好奇心和阅读兴趣。
- **结构**: 可参考“背景问题 + 核心内容 + 价值收获”的思路进行组织。

## 关键词 (keywords)
- **数量**: 2-8个。
- **类型**: 涵盖文章的核心主题、关键概念、所属领域或解决的问题。
- **策略**: 兼顾搜索热度与内容精准度，可包含1-2个长尾关键词。
- **避免**: 过于宽泛或无信息量的词汇 (例如："方法", "介绍")。

# 输入内容
**文章标题**: {title}

**文章正文**:
{content}
"""
)

# 构建处理链：获取通用LLM客户端，并为其绑定当前任务所需的输出结构
summarize_chain = SUMMARY_PROMPT | llm_client.with_structured_output(ArticleSummary)


async def summarize_article_task(
    post: Dict[str, Any], cache: CacheManager
) -> Dict[str, Any]:
    """
    处理单篇文章的异步任务函数，增加了缓存逻辑。
    """
    content_to_hash = post.get("content", "") + post.get("title", "")
    cache_key = hashlib.sha256(content_to_hash.encode("utf-8")).hexdigest()
    namespace = "article_summaries"

    # 1. 检查缓存
    cached_result = cache.get(namespace, cache_key)
    if cached_result:
        # print(f"缓存命中: 文章 {post.get('id')}")
        post["excerpt"] = cached_result.get("excerpt", "")
        post["keywords"] = cached_result.get("keywords", [])
        return post

    # 2. 缓存未命中，调用 LLM
    try:
        raw_result = await summarize_chain.ainvoke(
            {"title": post["title"], "content": post["content"]}
        )
        summary_data = cast(ArticleSummary, raw_result)

        post["excerpt"] = summary_data.excerpt
        post["keywords"] = summary_data.keywords

        # 3. 将新结果存入缓存
        cache.set(namespace, cache_key, summary_data.model_dump())
        return post
    except Exception as e:
        print(f"处理文章 {post.get('id')} 时出错: {e}")
        post["excerpt"] = "摘要生成失败"
        post["keywords"] = []
        return post


async def process_articles_node(state: GraphState, config: RunnableConfig) -> dict:
    """
    使用 asyncio.gather 并发处理所有文章的图节点。
    """
    print("--- 开始处理文章：生成摘要和关键词 ---")
    posts_to_process = list(state["posts"].values())

    # 从 config 中安全地获取 cache 实例
    cache = config.get("configurable", {}).get("cache")
    if cache is None:
        raise ValueError("未能从运行配置中获取缓存实例。请确保在图的配置中提供了缓存。")

    tasks = [summarize_article_task(post, cache) for post in posts_to_process]

    processed_posts_list = await asyncio.gather(*tasks)

    print(f"--- 完成处理 {len(processed_posts_list)} 篇文章 ---")
    return {"processed_posts": processed_posts_list}
