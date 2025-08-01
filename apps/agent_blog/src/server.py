from mcp.server.fastmcp import FastMCP
from dotenv import load_dotenv
import os
from langchain.chat_models import init_chat_model

load_dotenv()


if not os.getenv("GOOGLE_API_KEY"):
    raise ValueError("GOOGLE_API_KEY 没有正确传递")

mcp = FastMCP(
    name="AI Blog Agent Server",
    description="一个功能强大的AI代理，用于自动化博客内容的分析、SEO优化和组织。",
)

llm = init_chat_model("gemini-2.5-pro", model_provider="google_genai")
