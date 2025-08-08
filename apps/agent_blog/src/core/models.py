
"""
项目核心数据模型。
"""
from pydantic import BaseModel, Field

# --- API 输入模型 ---

class LabelInput(BaseModel):
    name: str

class ArticleInput(BaseModel):
    id: int
    title: str
    content: str
    labels: list[LabelInput]
    createdAt: str
    updatedAt: str

# --- 文章处理工具模型 ---

class SeoInfo(BaseModel):
    """单篇文章的SEO优化信息。"""
    title: str = Field(description="优化后的SEO标题")
    description: str = Field(description="优化后的SEO描述")
    keywords: list[str] = Field(description="文章的核心关键词列表")

class ProcessedArticle(BaseModel):
    """包含一篇文章所有AI生成内容的模型。"""
    id: int = Field(description="文章ID")
    seo: SeoInfo = Field(description="SEO信息")
    summary: str = Field(description="文章摘要")

class ProcessedArticleList(BaseModel):
    """用于存放多篇已处理文章的列表容器。"""
    articles: list[ProcessedArticle]

# --- 专栏处理工具模型 ---

class SeriesProposal(BaseModel):
    """一个基于标题分析得出的初步专栏结构。"""
    id: int = Field(description="专栏的ID，由AI系统生成，确保唯一性")
    name: str = Field(description="根据文章标题提取的专栏名称")
    posts: list[int] = Field(description="属于该专栏的所有文章的ID列表")
    count: int = Field(description="专栏包含的文章数量")
    lastUpdated: str = Field(description="专栏的最后更新时间，格式为YYYY-MM-DD HH:MM:SS")

class SeriesProposalsContainer(BaseModel):
    """一个用于存放专栏提案列表的容器。"""
    columns: list[SeriesProposal]

class SeriesInfo(BaseModel):
    """一个专栏的最终描述信息。"""
    id: int = Field(description="专栏的ID")
    name: str = Field(description="专栏的名称")
    description: str = Field(description="基于多篇文章简介生成的、对专栏的最终概括性描述，字数不超过100字")

# --- 站点SEO工具模型 ---

class SiteSeoInfo(BaseModel):
    """站点的全局SEO信息。"""
    title: str = Field(description="优化后的网站标题")
    description: str = Field(description="优化后的网站描述")
    keywords: list[str] = Field(description="网站的核心关键词列表")

