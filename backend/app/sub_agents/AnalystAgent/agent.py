from google.adk.agents import LlmAgent
from app.config import get_model
from models.schemas import AnalysisResult
from app.sub_agents.AnalystAgent.prompt import ANALYST_PROMPT

analyst_llm = LlmAgent(
    name="AnalystAgent",
    model=get_model(),
    instruction=ANALYST_PROMPT,
    output_schema=AnalysisResult,
    output_key="analysis_result",
    include_contents="none",
    disallow_transfer_to_peers=True,
)
