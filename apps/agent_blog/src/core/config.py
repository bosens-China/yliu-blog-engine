"""
应用配置模块。

用于加载环境变量、初始化外部服务客户端（如 LLM），供项目其他部分统一调用。
"""

import logging
import os
import sys
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

# --- 日志配置 ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    stream=sys.stdout,
)

# --- 环境变量加载 ---
_ = load_dotenv()

# --- 服务初始化 ---
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("必须设置 OPENAI_API_KEY 环境变量。")

# 初始化大语言模型客户端
llm = ChatOpenAI(
    model="Qwen/Qwen3-235B-A22B-Thinking-2507",
    base_url="https://api-inference.modelscope.cn/v1",
    # api_key=api_key,
)
