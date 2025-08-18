# graph/nodes/seo.py
"""
包含与站点全局SEO生成相关的图节点。
"""

from typing import cast
from langchain_core.prompts import PromptTemplate

# 导入通用LLM客户端和所需模型
from ...services.llm import llm_client
from ...models import GraphState, SiteSEO

# --- 此节点的专属Prompt和Chain定义 ---

SITE_SEO_PROMPT = PromptTemplate.from_template(
    """
# 角色
你是一位顶级的网站内容与SEO策略专家，能够通过分析全站内容，精准提炼出网站的核心定位与价值，并将其转化为高效的SEO元数据。

# 核心任务
基于网站的全量内容数据（文章标题、摘要、关键词等），进行深度综合分析，生成全局的、最优化的SEO元数据（Description, Keywords），以最大化网站在搜索引擎中的可见性和吸引力。

# 分析与提炼的思维框架
你必须从以下角度思考和总结：
1.  **主题聚类**: 网站内容最常聚焦的核心主题是什么？（例如：前端开发、家庭烘焙、日本旅行）
2.  **内容特色**: 网站内容的独特之处是什么？是深度解析、新手友好、实战案例，还是创意食谱？
3.  **核心价值**: 用户访问这个网站，最终能获得什么核心收益？（例如：解决复杂技术问题、学会做蛋糕、规划完美旅程）
4.  **目标受众**: 这些内容主要是写给谁看的？（例如：资深开发者、厨房新手、背包客）

# SEO元数据生成要求

## 网站描述 (Description)
- **长度**: 100-200个字符。
- **结构**: 以一句话概括网站核心主题 -> 阐述其内容特色与独特价值 -> 点明目标读者并承诺收益。
- **要求**: 语言流畅，吸引点击，自然地融入2-3个核心关键词。

## 网站关键词 (Keywords)
- **数量**: 8-12个。
- **构成**:
    - **核心主题 (3-4个)**: 网站最高频、最重要的主题词。
    - **扩展领域 (2-3个)**: 与核心主题相关的次级领域或概念。
    - **价值/受众 (2-3个)**: 体现网站特色和目标用户的词，如“入门教程”、“深度解析”、“实战案例”、“新手指南”。
    - **长尾词 (1-2个)**: 具有代表性的具体问题或需求，如“如何学习React”、“提拉米苏做法”。

# 输入数据
**所有文章摘要和关键词**:
{posts_summary}

# 输出格式
请严格按照以下JSON结构输出，不要添加任何额外的解释：
```json
{{
  "description": "生成的网站描述",
  "keywords": ["关键词1", "关键词2", "关键词3"]
}}
```
"""
)

# 构建处理链
site_seo_chain = SITE_SEO_PROMPT | llm_client.with_structured_output(SiteSEO)


async def generate_site_seo_node(state: GraphState) -> dict:
    """
    根据所有文章的摘要、关键词和专栏信息，生成站点级别的SEO元数据。
    """
    print("--- 开始生成站点级别SEO信息 ---")
    final_columns = state.get("final_columns", [])
    processed_posts = state.get("processed_posts", [])

    if not processed_posts:
        print("缺少文章信息，跳过站点SEO生成。")
        return {"site_seo": None}

    # 格式化专栏信息
    columns_summary_str = ""
    if final_columns:
        columns_summary_str = "\n".join(
            [
                f"- 专栏: {col['name']}\n  描述: {col['description']}"
                for col in final_columns
            ]
        )
    else:
        columns_summary_str = "暂无专栏"

    # 格式化所有文章的摘要和关键词信息（不限制数量，使用所有文章）
    posts_summary_str = "\n".join(
        [
            f"- 标题: {post['title']}\n  摘要: {post['excerpt']}\n  关键词: {', '.join(post.get('keywords', []))}"
            for post in processed_posts
        ]
    )

    print(f"--- 基于 {len(processed_posts)} 篇文章的完整数据生成站点SEO ---")

    try:
        raw_result = await site_seo_chain.ainvoke(
            {"columns_summary": columns_summary_str, "posts_summary": posts_summary_str}
        )
        result = cast(SiteSEO, raw_result)

        print("--- 站点SEO信息生成完成 ---")
        return {"site_seo": result}
    except Exception as e:
        print(f"调用LLM生成站点SEO时出错: {e}")
        return {"site_seo": None}
