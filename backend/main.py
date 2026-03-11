from dotenv import load_dotenv
load_dotenv()

import asyncio
import json
import io
import sys
import pandas as pd
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from pipeline.enrichment import enrich
from pipeline.vectorizer import vectorize_summary
from state import store
from app.agent import root_agent

# --- Sample CSV data (no file needed) ---
SAMPLE_CSV = """Order_ID,Order_Date,Ship_Date,Expected_Delivery,Actual_Delivery,Warehouse_ID,Product_ID,Product_Category,Order_Value,Region
ORD-001,2024-01-01,2024-01-03,2024-01-07,2024-01-06,WH-01,PROD-A,Electronics,250.00,North
ORD-002,2024-01-02,2024-01-04,2024-01-08,2024-01-12,WH-02,PROD-B,Apparel,80.00,South
ORD-003,2024-01-03,2024-01-05,2024-01-09,2024-01-09,WH-01,PROD-C,Electronics,430.00,East
ORD-004,2024-01-04,2024-01-06,2024-01-10,2024-01-15,WH-03,PROD-A,Electronics,200.00,West
ORD-005,2024-01-05,2024-01-07,2024-01-11,2024-01-14,WH-02,PROD-D,Furniture,600.00,North
ORD-006,2024-01-06,2024-01-08,2024-01-12,2024-01-12,WH-04,PROD-B,Apparel,90.00,South
ORD-007,2024-01-07,2024-01-09,2024-01-13,2024-01-20,WH-04,PROD-C,Electronics,310.00,East
ORD-008,2024-01-08,2024-01-10,2024-01-14,2024-01-18,WH-03,PROD-A,Electronics,150.00,West
ORD-009,2024-01-09,2024-01-11,2024-01-15,2024-01-15,WH-01,PROD-D,Furniture,720.00,North
ORD-010,2024-01-10,2024-01-12,2024-01-16,2024-01-22,WH-04,PROD-B,Apparel,110.00,South
ORD-011,2024-01-11,2024-01-13,2024-01-17,2024-01-17,WH-02,PROD-C,Electronics,280.00,East
ORD-012,2024-01-12,2024-01-14,2024-01-18,2024-01-25,WH-04,PROD-A,Electronics,390.00,West
ORD-013,2024-01-13,2024-01-15,2024-01-19,2024-01-19,WH-01,PROD-D,Furniture,540.00,North
ORD-014,2024-01-14,2024-01-16,2024-01-20,2024-01-21,WH-03,PROD-B,Apparel,70.00,South
ORD-015,2024-01-15,2024-01-17,2024-01-21,2024-01-28,WH-04,PROD-C,Electronics,460.00,East
"""

TEST_QUESTION = "Which warehouse has the highest shipping delay?"


async def test():
    print("=" * 60)
    print("Supply Chain AI Copilot — Pipeline Test")
    print("=" * 60)

    # 1. Enrich sample CSV and load into store
    print("\n[1] Enriching sample CSV data...")
    df, summary_json = enrich(SAMPLE_CSV.encode())
    store.set_data(df, summary_json)
    print(f"    Rows loaded: {len(df)}")
    print(f"    Warehouses: {summary_json['warehouses']}")
    print(f"    Overall delay rate: {summary_json['overall_delay_rate']*100:.1f}%")

    print("\n[1b] Vectorizing summary into Pinecone...")
    count = vectorize_summary(summary_json)
    print(f"    Vectors upserted: {count}")

    # 2. Set up ADK runner
    print(f"\n[2] Running pipeline for question:")
    print(f"    \"{TEST_QUESTION}\"")
    print()

    session_service = InMemorySessionService()
    await session_service.create_session(
        app_name="supply_chain",
        user_id="test",
        session_id="s1",
        state={
            "user_question": TEST_QUESTION,
            "summary_json": json.dumps(summary_json),
        },
    )

    runner = Runner(agent=root_agent, app_name="supply_chain", session_service=session_service)

    # 3. Stream events
    async for event in runner.run_async(
        user_id="test",
        session_id="s1",
        new_message=types.Content(role="user", parts=[types.Part.from_text(text="run")]),
    ):
        if not event.content or not event.content.parts:
            continue
        text = event.content.parts[0].text
        if not text:
            continue

        # Pretty-print structured events; truncate LLM tokens
        try:
            payload = json.loads(text)
            evt = payload.get("event", "")
            if evt == "agent_start":
                print(f"  --> [{payload['agent']}] starting...")
            elif evt == "agent_done":
                print(f"  --> [{payload['agent']}] done")
            elif evt == "pinecone_fetch":
                print(f"  --> Pinecone: retrieved {payload['insights_retrieved']} insights")
            elif evt == "pinecone_write":
                if payload.get("status") == "error":
                    print(f"  [PINECONE ERROR] {payload.get('message')}", file=sys.stderr)
                else:
                    print(f"  --> Pinecone: insight stored")
            elif evt == "error":
                print(f"  [ERROR] {payload.get('message')}", file=sys.stderr)
        except (json.JSONDecodeError, AttributeError):
            if event.is_partial:
                print(f"  [token] {text[:80]}", end="", flush=True)
            else:
                print(f"  [{event.author}] {text[:120]}")

    print()

    # 4. Print final answer from session state
    session = await session_service.get_session(
        app_name="supply_chain", user_id="test", session_id="s1"
    )

    print("\n" + "=" * 60)
    print("FINAL ANSWER")
    print("=" * 60)
    final = session.state.get("final_answer")
    if final:
        if isinstance(final, dict):
            print(json.dumps(final, indent=2))
        else:
            print(json.dumps(final.model_dump(), indent=2))
    else:
        print("(no final_answer in session state)")

    print("\nANALYSIS RESULT")
    print("-" * 60)
    analysis = session.state.get("analysis_result")
    if analysis:
        if isinstance(analysis, dict):
            print(json.dumps(analysis, indent=2))
        else:
            print(json.dumps(analysis.model_dump(), indent=2))
    else:
        print("(no analysis_result in session state)")


if __name__ == "__main__":
    asyncio.run(test())
