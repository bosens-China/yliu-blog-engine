# graph/nodes/columns.py
"""
包含与专栏生成相关的图节点：文章分组和专栏描述。
"""

import asyncio
from typing import List, Dict, Tuple, cast
from langchain_core.prompts import PromptTemplate

# 导入通用LLM客户端和所需模型
from ...services.llm import llm_client
from ...models import GraphState, ColumnAnalysisResult, ColumnDescription

# --- 此节点的专属Prompt和Chain定义 ---

GROUPING_PROMPT = PromptTemplate.from_template(
    """
# 角色
你是一位精于内容策划的专家，尤其擅长从大量文章标题中，通过模式识别来找出结构化的内容系列（专栏）。

# 核心任务
分析给定的文章标题列表，找出并组织成具有明确系列关系的专栏。**重点是识别标题中的命名模式，而非对内容主题进行语义归纳。**

# 识别原则

1.  **基于标题模式 (Pattern-Based)**: **这是最重要的原则。** 你必须寻找标题中存在的共同前缀或结构。只有当多个标题共享一个明确、可识别的系列名称时，才应归为一类。
    *   **常见模式示例**:
        *   `[系列名称]之[分主题]` (例如: "深入JavaScript之this", "深入JavaScript之原型链")
        *   `[系列名称]系列：[分主题]` (例如: "Vue源码解析系列：响应式原理", "Vue源码解析系列：模板编译")
        *   `[系列名称]（一）`, `[系列名称]（二）`
        *   `[系列名称] - [分主题]` (例如: "手写Promise - 核心实现", "手写Promise - 异步链式调用")

2.  **专栏命名 (Column Naming)**: 专栏名称应直接从标题模式中提取共享的、不变的部分。
    *   例如，对于 "深入JavaScript之this" 和 "深入JavaScript之原型链"，理想的专栏名是 "深入JavaScript系列"。
    *   对于 "手写Promise - 核心实现" 和 "手写Promise - 异步链式调用"，专栏名应是 "手写Promise系列"。

3.  **质量门槛 (Quality Gate)**: 每个识别出的专栏必须至少包含2篇文章。

4.  **严格排除 (Strict Exclusion)**: **绝对不要**仅仅因为文章属于同一技术领域（例如，把所有关于 "React" 的文章放在一起）就将它们归为一个专栏。如果标题之间没有上述的系列化模式，即使主题高度相关，也不应成组。

# 输入格式
一个包含文章对象 `{{"id": <文章ID>, "title": "<文章标题>"}}` 的JSON数组。
{article_titles}

# 输出要求
严格按照下面的JSON格式返回。如果找不到任何符合模式的专栏，`columns` 字段必须返回一个空数组 `[]`。

```json
{{
  "columns": [
    {{
      "column_name": "提取的系列名称",
      "article_ids": [101, 105]
    }}
  ]
}}
```
"""
)


DESCRIPTION_PROMPT = PromptTemplate.from_template(
    """
# 角色
你是一位资深技术作者与内容规划师，擅长用清晰、直接的语言为技术专栏撰写简介，帮助读者快速了解专栏的核心内容和学习价值。

# 核心任务
基于专栏名称及其包含的文章列表，撰写一段100-200字的专栏简介。

# 简介结构与要求

1.  **目标陈述**: 开门见山，直接说明本专栏要做什么。例如：“本专栏将带你从零开始...”、“这是一个关于...的实战系列”。
2.  **内容概览**: 清晰列出专栏将涵盖的核心技术、关键步骤或主要议题。
3.  **学习收获**: 明确指出读者跟随本专栏学习后，能够掌握哪些具体技能或理解哪些核心概念。

# 风格要求
- **语调**: 朴素、客观、专业。
- **重点**: 以陈述事实为主，清晰地传递信息。
- **避免**: 使用夸张的营销性词汇（如“彻底解决”、“一步到位”）、反问句或过于情绪化的表达。

# 输入信息

**专栏名称**: {column_name}

**包含文章详情**:
{articles_info}

# 输出格式
请严格按照以下JSON结构输出，不要添加任何额外的解释：
```json
{{
  "description": "专栏简介内容（100-200字）"
}}
```
"""
)

# 构建处理链
grouping_chain = GROUPING_PROMPT | llm_client.with_structured_output(
    ColumnAnalysisResult
)
description_chain = DESCRIPTION_PROMPT | llm_client.with_structured_output(
    ColumnDescription
)

# --- 节点函数实现 ---


async def group_articles_node(state: GraphState) -> dict:
    """
    分析所有文章的标题，将它们分组到不同的专栏中。
    """
    print("--- 开始分析文章标题，进行专栏分组 ---")
    processed_posts = state.get("processed_posts", [])
    if not processed_posts or len(processed_posts) < 2:
        print("文章数量不足，跳过专栏分组。")
        return {"columns": {}}

    title_list_str = "\n".join(
        [f"{post['id']} - {post['title']}" for post in processed_posts]
    )

    try:
        raw_result = await grouping_chain.ainvoke({"article_titles": title_list_str})
        result = cast(ColumnAnalysisResult, raw_result)
        columns_map = {group.column_name: group.article_ids for group in result.columns}
        print(f"--- 专栏分组完成，共生成 {len(columns_map)} 个专栏 ---")
        return {"columns": columns_map}
    except Exception as e:
        print(f"调用LLM进行专栏分组时出错: {e}")
        print(f"错误详情: {type(e).__name__}: {str(e)}")
        # 如果是格式错误，尝试记录原始返回值
        if "validation error" in str(e).lower():
            try:
                # 重新调用但不使用structured_output来看原始返回
                print("尝试获取LLM原始返回以进行调试...")
                debug_result = await (GROUPING_PROMPT | llm_client).ainvoke(
                    {"article_titles": title_list_str}
                )
                print(f"LLM原始返回: {debug_result.content}")
            except Exception as debug_e:
                print(f"调试获取失败: {debug_e}")
        return {"columns": {}}


async def describe_single_column_task(
    args: Tuple[str, List[int], Dict[int, dict]],
) -> dict:
    """
    为单个专栏生成描述的异步任务函数。
    """
    column_name, article_ids, post_map = args

    articles_info_str = "\n".join(
        [
            f"- 标题: {post_map[id]['title']}\n  摘要: {post_map[id]['excerpt']}"
            for id in article_ids
            if id in post_map
        ]
    )

    try:
        raw_result = await description_chain.ainvoke(
            {"column_name": column_name, "articles_info": articles_info_str}
        )
        result = cast(ColumnDescription, raw_result)
        return {
            "name": column_name,
            "description": result.description,
            "posts": article_ids,
        }
    except Exception as e:
        print(f"为专栏‘{column_name}’生成描述时出错: {e}")
        return {
            "name": column_name,
            "description": "",
            "posts": article_ids,
        }


async def describe_columns_node(state: GraphState) -> dict:
    """
    使用 asyncio.gather 并发地为每个已分组的专栏生成详细描述。
    """
    print("--- 开始为每个专栏生成描述 ---")
    columns = state.get("columns", {})
    processed_posts = state.get("processed_posts", [])

    if not columns or not processed_posts:
        print("缺少专栏或文章信息，跳过描述生成。")
        return {"final_columns": []}

    post_map = {post["id"]: post for post in processed_posts}

    tasks = [
        describe_single_column_task((name, ids, post_map))
        for name, ids in columns.items()
    ]

    final_columns = await asyncio.gather(*tasks)

    print(f"--- 完成 {len(final_columns)} 个专栏的描述生成 ---")
    return {"final_columns": final_columns}
