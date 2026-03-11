from google.adk.models.google_llm import Gemini

MODEL_NAME = "gemini-2.5-flash-lite"


def get_model(model: str = MODEL_NAME) -> Gemini:
    return Gemini(model=model)
