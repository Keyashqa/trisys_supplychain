from dotenv import load_dotenv
load_dotenv()

import json
import os
import uuid
import asyncio
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from models.schemas import AskRequest, UploadResponse
from pipeline.enrichment import enrich
from pipeline.vectorizer import vectorize_summary
from state import store
from app.agent import root_agent

app = FastAPI(title="Supply Chain AI Copilot")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

session_service = InMemorySessionService()
runner = Runner(agent=root_agent, app_name="supply_chain", session_service=session_service)


@app.on_event("startup")
async def validate_env():
    missing = [k for k in ("GOOGLE_API_KEY", "PINECONE_API_KEY", "PINECONE_INDEX_NAME") if not os.getenv(k)]
    if missing:
        raise RuntimeError(f"Missing required env vars: {', '.join(missing)}")


@app.post("/upload", response_model=UploadResponse)
async def upload_csv(csv_file: UploadFile = File(...)):
    content = await csv_file.read()
    try:
        df, summary_json = enrich(content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"CSV parse error: {e}")

    store.set_data(df, summary_json)

    try:
        insights_count = vectorize_summary(summary_json)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pinecone vectorization error: {e}")

    return UploadResponse(
        status="ready",
        rows_loaded=len(df),
        warehouses_found=summary_json["warehouses"],
        insights_vectorized=insights_count,
        summary=summary_json,
    )


def _translate_event_to_sse(event) -> str | None:
    if not event.content or not event.content.parts:
        return None

    text = ""
    for part in event.content.parts:
        if hasattr(part, "text") and part.text:
            text += part.text

    if not text:
        return None

    # Try to detect structured metadata events from pipeline
    try:
        payload = json.loads(text)
        evt_type = payload.get("event")
        if evt_type in ("agent_start", "agent_done", "pinecone_fetch", "pinecone_write", "error"):
            return f"event: {evt_type}\ndata: {json.dumps(payload)}\n\n"
    except (json.JSONDecodeError, AttributeError):
        pass

    # LLM streaming tokens
    try:
        if not event.is_final_response():
            return f"event: token\ndata: {json.dumps({'text': text})}\n\n"
    except Exception:
        pass

    return None


@app.post("/ask")
async def ask_question(request: AskRequest):
    _, summary_json = store.get_data()
    if summary_json is None:
        raise HTTPException(status_code=400, detail="No data loaded. Upload a CSV first.")

    session_id = str(uuid.uuid4())
    initial_state = {
        "user_question": request.question,
        "summary_json": json.dumps(summary_json),
    }

    await session_service.create_session(
        app_name="supply_chain",
        user_id="user",
        session_id=session_id,
        state=initial_state,
    )

    async def event_generator():
        message = types.Content(role="user", parts=[types.Part(text="run")])
        try:
            async for event in runner.run_async(
                user_id="user",
                session_id=session_id,
                new_message=message,
            ):
                sse = _translate_event_to_sse(event)
                if sse:
                    yield sse
                await asyncio.sleep(0)
        except Exception as e:
            yield f"event: error\ndata: {json.dumps({'message': str(e)})}\n\n"
            return

        # Emit final complete event
        try:
            session = await session_service.get_session(
                app_name="supply_chain", user_id="user", session_id=session_id
            )
            final_answer = session.state.get("final_answer")
            if isinstance(final_answer, dict):
                complete_data = final_answer
            elif final_answer:
                complete_data = final_answer.model_dump() if hasattr(final_answer, "model_dump") else dict(final_answer)
            else:
                complete_data = {}
            yield f"event: complete\ndata: {json.dumps(complete_data)}\n\n"
        except Exception as e:
            yield f"event: complete\ndata: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
