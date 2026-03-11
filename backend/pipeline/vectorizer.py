from __future__ import annotations
import os
import json
from datetime import datetime, timezone
from pinecone import Pinecone
from pipeline.embeddings import embed


def vectorize_summary(summary_json: dict) -> int:
    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
    index = pc.Index(os.getenv("PINECONE_INDEX_NAME"))

    vectors = []
    ts = datetime.now(timezone.utc).isoformat()

    # Global summary vector
    global_text = (
        f"Supply chain overview: {summary_json['total_rows']} orders analyzed. "
        f"Overall delay rate: {summary_json['overall_delay_rate']*100:.1f}%. "
        f"Average shipping delay: {summary_json['avg_shipping_delay']} days. "
        f"Average processing time: {summary_json['avg_processing_time']} days. "
        f"Warehouses: {', '.join(summary_json['warehouses'])}."
    )
    vectors.append({
        "id": f"global_summary_{ts}",
        "values": embed(global_text),
        "metadata": {"type": "global_summary", "entity": "all", "timestamp": ts, "text": global_text},
    })

    # Per-warehouse vectors
    for wh in summary_json.get("warehouse_stats", []):
        text = (
            f"Warehouse {wh['Warehouse_ID']}: {wh['total_orders']} orders, "
            f"average delay {wh['avg_delay']} days, "
            f"delay rate {wh['delay_rate']*100:.1f}%."
        )
        vectors.append({
            "id": f"warehouse_{wh['Warehouse_ID']}_{ts}",
            "values": embed(text),
            "metadata": {
                "type": "warehouse_stats",
                "entity": wh["Warehouse_ID"],
                "timestamp": ts,
                "text": text,
            },
        })

    # Per-product vectors (top 10 by avg_delay)
    products = sorted(
        summary_json.get("product_stats", []),
        key=lambda x: abs(x.get("avg_delay", 0)),
        reverse=True,
    )[:10]
    for prod in products:
        text = (
            f"Product {prod['Product_ID']}: average processing time {prod['avg_processing_time']} days, "
            f"average delay {prod['avg_delay']} days."
        )
        vectors.append({
            "id": f"product_{prod['Product_ID']}_{ts}",
            "values": embed(text),
            "metadata": {
                "type": "product_stats",
                "entity": prod["Product_ID"],
                "timestamp": ts,
                "text": text,
            },
        })

    # Anomaly vector — warehouses with delay_rate > 0.4
    high_delay_wh = [
        w for w in summary_json.get("warehouse_stats", []) if w.get("delay_rate", 0) > 0.4
    ]
    if high_delay_wh:
        names = ", ".join(w["Warehouse_ID"] for w in high_delay_wh)
        text = f"Anomaly detected: warehouses with >40% delay rate: {names}."
        vectors.append({
            "id": f"anomaly_high_delay_{ts}",
            "values": embed(text),
            "metadata": {"type": "anomaly", "entity": names, "timestamp": ts, "text": text},
        })

    # Upsert in batches of 20
    batch_size = 20
    for i in range(0, len(vectors), batch_size):
        index.upsert(vectors=vectors[i : i + batch_size])

    return len(vectors)
