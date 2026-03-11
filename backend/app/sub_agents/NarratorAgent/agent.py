from google.adk.agents import LlmAgent
from app.config import get_model
from models.schemas import FinalAnswer
from app.sub_agents.NarratorAgent.prompt import NARRATOR_PROMPT

narrator_llm = LlmAgent(
    name="NarratorAgent",
    model=get_model(),
    instruction=NARRATOR_PROMPT,
    output_schema=FinalAnswer,
    output_key="final_answer",
    include_contents="none",
    disallow_transfer_to_peers=True,
)
