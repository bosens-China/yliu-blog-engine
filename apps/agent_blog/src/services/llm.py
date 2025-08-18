# services/llm.py
"""
中央模块，用于初始化和提供通用的LLM客户端实例。
"""

import os
from langchain_openai import ChatOpenAI
from pydantic import SecretStr

api_key = os.getenv("OPENAI_API_KEY")
secret_api_key = SecretStr(api_key or "")


llm_client = ChatOpenAI(
    model="qwen-turbo-latest",
    api_key=secret_api_key,
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
)
