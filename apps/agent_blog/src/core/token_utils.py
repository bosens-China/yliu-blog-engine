import tiktoken


def count_tokens(text: str) -> int:
    """计算文本的token数量，但是因为使用的是gemini模型，计算的评估并不一定完全准确，为了安全起见，这里直接改为1.2倍的token数量"""
    encoding = tiktoken.get_encoding("cl100k_base")
    return int(len(encoding.encode(text)) * 1.2)
