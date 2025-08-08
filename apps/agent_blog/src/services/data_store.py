"""
内存数据存储模块。
"""
from ..core.models import ArticleInput

class ArticleDataStore:
    """一个用于在内存中存储和操作文章数据的类。"""

    def __init__(self):
        self._data: list[ArticleInput] = []

    def get_by_id(self, article_id: int) -> ArticleInput | None:
        """根据 ID 返回单篇文章。"""
        for article in self._data:
            if article.id == article_id:
                return article
        return None

    def get_all_articles(self) -> list[ArticleInput]:
        """返回所有文章。"""
        return self._data

    def load(self, data: list[ArticleInput]):
        """
        用新的数据完全覆盖内存存储。
        """
        self._data = data.copy() if data else []


# 创建一个全局单例
article_store = ArticleDataStore()
