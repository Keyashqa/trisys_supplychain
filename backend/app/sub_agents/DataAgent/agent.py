from __future__ import annotations
import json
import numpy as np


class _NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super().default(obj)
from typing_extensions import override
from google.adk.agents import BaseAgent
from google.adk.agents.invocation_context import InvocationContext
from google.adk.events import Event
from google.genai import types
from state import store


INTENT_KEYWORDS = {
    "worst_warehouse": ["worst", "highest delay", "most delayed", "slowest warehouse", "worst warehouse"],
    "fastest_product": ["fastest", "quickest", "best processing", "lowest processing", "fastest product"],
    "avg_delay_warehouse": ["average delay", "avg delay", "mean delay", "delay by warehouse"],
    "delayed_orders_list": ["delayed orders", "list of delays", "how many delayed", "delayed shipments"],
}


def _classify_intent(question: str) -> str:
    q = question.lower()
    for intent, keywords in INTENT_KEYWORDS.items():
        if any(kw in q for kw in keywords):
            return intent
    return "general_summary"


def _run_pandas_query(intent: str, df, summary_json: dict) -> tuple[dict, list[dict], list[str]]:
    anomalies: list[str] = []

    if intent == "worst_warehouse":
        stats = df.groupby("Warehouse_ID")["Shipping_Delay"].mean().sort_values(ascending=False).reset_index()
        stats.columns = ["warehouse_id", "avg_delay_days"]
        result = {"warehouse_delay_ranking": stats.round(2).to_dict(orient="records")}
        top = stats.head(5).to_dict(orient="records")
        # Detect anomalies: warehouses > mean + 2σ
        mean, std = stats["avg_delay_days"].mean(), stats["avg_delay_days"].std()
        outliers = stats[stats["avg_delay_days"] > mean + 2 * std]["warehouse_id"].tolist()
        if outliers:
            anomalies.append(f"Anomalous delay detected in warehouses: {', '.join(map(str, outliers))}")

    elif intent == "fastest_product":
        stats = df.groupby("Product_ID")["Order_Processing_Time"].mean().sort_values().reset_index()
        stats.columns = ["product_id", "avg_processing_days"]
        result = {"product_processing_ranking": stats.round(2).head(20).to_dict(orient="records")}
        top = stats.head(5).to_dict(orient="records")
        mean, std = stats["avg_processing_days"].mean(), stats["avg_processing_days"].std()
        outliers = stats[stats["avg_processing_days"] > mean + 2 * std]["product_id"].tolist()
        if outliers:
            anomalies.append(f"Slow processing outliers: {', '.join(map(str, outliers))}")

    elif intent == "avg_delay_warehouse":
        stats = df.groupby("Warehouse_ID")["Shipping_Delay"].mean().reset_index()
        stats.columns = ["warehouse_id", "avg_delay_days"]
        result = {"avg_delay_by_warehouse": stats.round(2).to_dict(orient="records")}
        top = stats.sort_values("avg_delay_days", ascending=False).head(5).to_dict(orient="records")

    elif intent == "delayed_orders_list":
        delayed = df[df["Is_Delayed"]]
        sample = delayed.head(5)[["Order_ID", "Warehouse_ID", "Product_ID", "Shipping_Delay"]].to_dict(orient="records")
        result = {
            "total_delayed": int(delayed.shape[0]),
            "delay_rate": round(float(delayed.shape[0] / len(df)), 4),
            "sample_delayed_orders": sample,
        }
        top = sample[:5]
        if result["delay_rate"] > 0.5:
            anomalies.append(f"Critical: over 50% of orders are delayed ({result['delay_rate']*100:.1f}%)")

    else:  # general_summary
        result = summary_json
        top = summary_json.get("warehouse_stats", [])[:5]

    return result, top, anomalies


class DataAgent(BaseAgent):
    model_config = {"arbitrary_types_allowed": True}

    def __init__(self) -> None:
        super().__init__(name="DataAgent", sub_agents=[])

    @override
    async def _run_async_impl(self, ctx: InvocationContext):
        yield Event(
            author=self.name,
            content=types.Content(role="model", parts=[types.Part(text='{"event":"agent_start","agent":"DataAgent"}')]),
        )

        df, summary_json = store.get_data()
        if df is None or summary_json is None:
            yield Event(
                author=self.name,
                content=types.Content(role="model", parts=[types.Part(text='{"event":"error","message":"No data loaded. Upload a CSV first."}')]),
            )
            return

        question = ctx.session.state.get("user_question", "")
        intent = _classify_intent(question)
        result_summary, top_entities, anomalies = _run_pandas_query(intent, df, summary_json)

        data_context = {
            "question_intent": intent,
            "result_summary": result_summary,
            "rows_analyzed": len(df),
            "top_entities": top_entities,
            "anomalies_detected": anomalies,
        }
        ctx.session.state["data_context"] = json.dumps(data_context, cls=_NumpyEncoder)

        yield Event(
            author=self.name,
            content=types.Content(
                role="model",
                parts=[types.Part(text=json.dumps({"event": "agent_done", "agent": "DataAgent", "result": data_context}, cls=_NumpyEncoder))],
            ),
        )


data_agent = DataAgent()
