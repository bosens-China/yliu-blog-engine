# models.py

from pydantic import BaseModel, Field
from typing import List, Dict, TypedDict

# --- API 输入模型 ---


class Post(BaseModel):
    """接收的文章数据模型，只包含必要字段"""

    id: int
    title: str
    content: str
    created_at: str = Field(alias="createdAt")
    updated_at: str = Field(alias="updatedAt")


# --- LLM 结构化输出模型 ---


class ArticleSummary(BaseModel):
    """用于文章摘要和关键词生成的LLM输出模型"""

    excerpt: str = Field(description="文章的简短摘要，长度在100-150字之间")
    keywords: List[str] = Field(description="与文章内容最相关的5-7个SEO关键词")


class Column(BaseModel):
    """表示单个专栏及其包含的文章。"""

    column_name: str = Field(description="专栏的名称。")
    article_ids: List[int] = Field(description="此专栏中文章的ID。")


class ColumnAnalysisResult(BaseModel):
    """专栏分析的结果，包含一个专栏列表。"""

    columns: List[Column] = Field(description="一个已识别的专栏列表。")


class ColumnDescription(BaseModel):
    """专栏描述生成的结果。"""

    description: str = Field(description="生成的专栏描述。")


class SiteSEO(BaseModel):
    """站点SEO生成的结果。"""

    description: str = Field(description="站点的全局SEO描述。")
    keywords: List[str] = Field(description="站点的全局SEO关键词列表。")


# --- Graph State 模型 ---


class GraphState(TypedDict):
    """
    图的状态，它将贯穿整个 AI 处理流程。
    """

    posts: Dict[int, dict]
    processed_posts: List[dict]
    columns: Dict[str, List[int]]
    final_columns: List[dict]
    site_seo: SiteSEO | None
