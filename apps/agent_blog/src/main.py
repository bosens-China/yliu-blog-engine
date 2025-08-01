from typing import List
from fastapi import FastAPI
from .schemas import ArticleInput

app = FastAPI()


@app.post("/blog/generate")
async def generate_blog(article_input: List[ArticleInput]):
    return article_input
