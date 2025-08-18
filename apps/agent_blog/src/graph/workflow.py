# graph/workflow.py
"""
定义 GraphState 并构建和编译整个工作流。
"""

from langgraph.graph import StateGraph, END

# 从根目录的 models.py 导入 GraphState
from ..models import GraphState

# 从 nodes 子目录中导入所有节点函数
from .nodes.articles import process_articles_node
from .nodes.columns import group_articles_node, describe_columns_node
from .nodes.seo import generate_site_seo_node


# --- 条件边的判断函数 ---

def should_describe_columns(state: GraphState) -> str:
    """
    判断是否应该执行专栏描述节点。
    如果有专栏生成，则继续描述；否则，直接跳到SEO生成。
    """
    print("--- 判断是否需要生成专栏描述 ---")
    if state.get("columns") and state["columns"]:
        print("--- > 是，继续生成专栏描述 ---")
        return "describe_columns"
    else:
        print("--- > 否，跳过专栏描述，直接生成站点SEO ---")
        return "generate_site_seo"


# --- 图的构建 ---

# 定义工作流，并传入我们定义好的状态模型
workflow = StateGraph(GraphState)

# 添加所有节点
workflow.add_node("process_articles", process_articles_node)
workflow.add_node("group_articles", group_articles_node)
workflow.add_node("describe_columns", describe_columns_node)
workflow.add_node("generate_site_seo", generate_site_seo_node)

# 设置边的连接关系
workflow.set_entry_point("process_articles")
workflow.add_edge("process_articles", "group_articles")

# 添加条件边
workflow.add_conditional_edges(
    "group_articles",
    should_describe_columns,
    {
        # 如果should_describe_columns返回"describe_columns"，则下一个节点是describe_columns
        "describe_columns": "describe_columns",
        # 如果返回"generate_site_seo"，则下一个节点是generate_site_seo
        "generate_site_seo": "generate_site_seo",
    },
)

workflow.add_edge("describe_columns", "generate_site_seo")
workflow.add_edge("generate_site_seo", END)

# 编译图，并将其命名为 agent_app 以便在 main.py 中清晰地导入
agent_app = workflow.compile()