from __future__ import annotations
import json
import os
from typing_extensions import override
from google.adk.agents import BaseAgent
from google.adk.agents.invocation_context import InvocationContext
from google.adk.events import Event
from google.genai import types
from pinecone import Pinecone

from app.sub_agents.DataAgent import data_agent
from app.sub_agents.AnalystAgent import analyst_llm
from app.sub_agents.NarratorAgent import narrator_llm
from pipeline.embeddings import embed
from pipeline.pinecone_writer import write_insight


def _retrieve_pinecone_context(question: str, top_k: int = 3) -> list[str]:
    try:
        pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        index = pc.Index(os.getenv("PINECONE_INDEX_NAME"))
        query_vector = embed(question)
        results = index.query(vector=query_vector, top_k=top_k, include_metadata=True)
        return [match.metadata.get("text", "") for match in results.matches if match.metadata]
    except Exception:
        return []


class SupplyChainPipeline(BaseAgent):
    model_config = {"arbitrary_types_allowed": True}

    data_agent: BaseAgent
    analyst_llm: object
    narrator_llm: object

    def __init__(self) -> None:
        super().__init__(
            name="SupplyChainPipeline",
            data_agent=data_agent,
            analyst_llm=analyst_llm,
            narrator_llm=narrator_llm,
            sub_agents=[data_agent, analyst_llm, narrator_llm],
        )

    @override
    async def _run_async_impl(self, ctx: InvocationContext):
        # 1. DataAgent — deterministic Pandas
        async for event in self.data_agent.run_async(ctx):
            yield event

        # 2. Pinecone retrieval
        question = ctx.session.state.get("user_question", "")
        insights = _retrieve_pinecone_context(question)
        ctx.session.state["pinecone_context"] = "\n".join(insights) if insights else "No prior insights available."

        yield Event(
            author=self.name,
            content=types.Content(
                role="model",
                parts=[types.Part(text=json.dumps({"event": "pinecone_fetch", "insights_retrieved": len(insights)}))],
            ),
        )

        # 3. AnalystAgent — LLM reasoning
        yield Event(
            author=self.name,
            content=types.Content(
                role="model",
                parts=[types.Part(text=json.dumps({"event": "agent_start", "agent": "AnalystAgent", "status": "running"}))],
            ),
        )
        async for event in self.analyst_llm.run_async(ctx):
            yield event

        # 4. NarratorAgent — LLM narration
        yield Event(
            author=self.name,
            content=types.Content(
                role="model",
                parts=[types.Part(text=json.dumps({"event": "agent_start", "agent": "NarratorAgent", "status": "running"}))],
            ),
        )
        async for event in self.narrator_llm.run_async(ctx):
            yield event

        # 5. Write insight back to Pinecone
        analysis = ctx.session.state.get("analysis_result")
        if analysis:
            if isinstance(analysis, dict):
                insight_text = analysis.get("generated_insight", "")
                intent = ctx.session.state.get("data_context")
                if isinstance(intent, str):
                    try:
                        intent = json.loads(intent).get("question_intent", "general_summary")
                    except Exception:
                        intent = "general_summary"
                top_entities = []
                data_ctx = ctx.session.state.get("data_context")
                if isinstance(data_ctx, str):
                    try:
                        top_entities = [str(e.get("warehouse_id") or e.get("product_id") or "") for e in json.loads(data_ctx).get("top_entities", [])]
                    except Exception:
                        pass
            else:
                insight_text = getattr(analysis, "generated_insight", "")
                intent = "general_summary"
                top_entities = []

            if insight_text:
                try:
                    write_insight(insight_text, question, intent, top_entities)
                    yield Event(
                        author=self.name,
                        content=types.Content(
                            role="model",
                            parts=[types.Part(text=json.dumps({"event": "pinecone_write", "status": "insight_stored"}))],
                        ),
                    )
                except Exception as e:
                    yield Event(
                        author=self.name,
                        content=types.Content(
                            role="model",
                            parts=[types.Part(text=json.dumps({"event": "pinecone_write", "status": "error", "message": str(e)}))],
                        ),
                    )


root_agent = SupplyChainPipeline()
