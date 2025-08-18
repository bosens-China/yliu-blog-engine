# services/llm.py
"""
中央模块，用于初始化和提供通用的、带速率限制的LLM客户端实例。
"""

import os
from pydantic import SecretStr
from langchain_openai import ChatOpenAI
from langchain_core.rate_limiters import InMemoryRateLimiter
from ..utils.logger import log, warn

# --- 客户端实例化 ---

# 从环境变量读取配置，提供默认值
api_key = os.getenv("OPENAI_API_KEY")
model_name = os.getenv("OPENAI_MODEL_NAME") or "qwen-turbo-2025-07-15"
base_url = (
    os.getenv("OPENAI_BASE_URL") or "https://dashscope.aliyuncs.com/compatible-mode/v1"
)

try:
    # 默认为50 RPM，为服务端的60 RPM限制留出一些缓冲
    rpm_limit = int(os.getenv("LLM_RPM_LIMIT") or "50")
except (ValueError, TypeError):
    warn("无效的 LLM_RPM_LIMIT 值，将使用默认值 50。")
    rpm_limit = 50

try:
    # 默认为5个并发请求，这是一个保守的初始值
    burst_limit = int(os.getenv("LLM_BURST_LIMIT") or "5")
except (ValueError, TypeError):
    warn("无效的 LLM_BURST_LIMIT 值，将使用默认值 5。")
    burst_limit = 5

# 初始化 LangChain 内置的速率限制器
rate_limiter = None
if rpm_limit > 0:
    # 根据RPM计算每秒请求数
    requests_per_second = rpm_limit / 60.0

    rate_limiter = InMemoryRateLimiter(
        requests_per_second=requests_per_second,
        max_bucket_size=burst_limit,
    )
    log(
        f"LLM 速率限制器已启用，限制为 {rpm_limit} RPM ({requests_per_second:.2f} RPS)，突发限制为 {burst_limit}。"
    )
else:
    log("LLM 速率限制器未启用。")


secret_api_key = SecretStr(api_key or "")

# 直接使用 ChatOpenAI，并传入 rate_limiter
# 根据社区最佳实践，将限流器与少量的重试次数结合使用，以获得最佳健壮性
llm_client = ChatOpenAI(
    model=model_name,
    api_key=secret_api_key,
    base_url=base_url,
    rate_limiter=rate_limiter,  # 传入官方限流器
    max_retries=2,  # 重新启用一个小的重试次数，以处理瞬时网络错误
)
