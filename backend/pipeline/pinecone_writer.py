from __future__ import annotations
import os
from datetime import datetime, timezone
from pinecone import Pinecone
from pipeline.embeddings import embed


def write_insight(
    insight: str,
    question: str,
    intent: str,
    entities: list[str],
) -> None:
    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
    index = pc.Index(os.getenv("PINECONE_INDEX_NAME"))

    ts = datetime.now(timezone.utc).isoformat()
    vector_id = f"insight_{intent}_{ts}"

    index.upsert(vectors=[{
        "id": vector_id,
        "values": embed(insight),
        "metadata": {
            "type": "query_insight",
            "question": question,
            "intent": intent,
            "entities_mentioned": ", ".join(entities),
            "timestamp": ts,
            "text": insight,
        },
    }])
