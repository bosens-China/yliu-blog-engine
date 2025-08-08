"""
定义和组装核心 Agent。
"""
from langchain.agents import AgentExecutor, create_react_agent
from langchain_core.prompts import ChatPromptTemplate

from ..core.config import llm
from ..core.prompts import ORCHESTRATOR_SYSTEM_PROMPT
from ..tools.article_tools import process_articles
from ..tools.series_tools import (
    propose_series_from_articles,
    generate_series_description,
)
from ..tools.site_tools import generate_site_seo


def get_seo_agent_executor() -> AgentExecutor:
    """
    构建并返回用于处理SEO任务的Agent执行器。
    这个Agent根据一系列文章ID，按顺序执行SEO优化、专栏处理和站点信息生成。
    """
    tools = [
        process_articles,
        propose_series_from_articles,
        generate_series_description,
        generate_site_seo,
    ]

    # ReAct风格的Prompt模板
    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", ORCHESTRATOR_SYSTEM_PROMPT),
            ("human", "{input}"),
            # agent_scratchpad 是Agent的短期记忆，存放之前的思考和行动
            ("ai", "{agent_scratchpad}"),
        ]
    )

    # 创建 ReAct Agent
    agent = create_react_agent(llm, tools, prompt)

    # 创建 Agent 执行器
    agent_executor = AgentExecutor(
        agent=agent,
        tools=tools,
        verbose=True,  # 在开发阶段设为True，可以看到Agent完整的思考链
        handle_parsing_errors=True,  # 增加健壮性，防止LLM输出格式错误导致程序崩溃
    )

    return agent_executor