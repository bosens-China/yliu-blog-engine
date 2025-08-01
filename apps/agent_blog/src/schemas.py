from pydantic import BaseModel


class LabelInput(BaseModel):
    name: str


class ArticleInput(BaseModel):
    id: int
    title: str
    content: str
    labels: list[LabelInput]
    createdAt: str
    updatedAt: str
