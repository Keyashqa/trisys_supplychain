from __future__ import annotations
import io
import numpy as np
import pandas as pd


def enrich(csv_bytes: bytes) -> tuple[pd.DataFrame, dict]:
    df = pd.read_csv(io.BytesIO(csv_bytes))

    for col in ["Order_Date", "Ship_Date", "Expected_Delivery", "Actual_Delivery"]:
        df[col] = pd.to_datetime(df[col], errors="coerce")

    df["Order_Processing_Time"] = (df["Ship_Date"] - df["Order_Date"]).dt.days
    df["Shipping_Delay"] = (df["Actual_Delivery"] - df["Expected_Delivery"]).dt.days
    df["Is_Delayed"] = df["Shipping_Delay"] > 0

    conditions = [
        df["Shipping_Delay"] <= 0,
        (df["Shipping_Delay"] > 0) & (df["Shipping_Delay"] <= 3),
    ]
    df["Delay_Severity"] = np.select(conditions, ["on_time", "minor"], default="critical")

    warehouse_stats = (
        df.groupby("Warehouse_ID")
        .agg(
            avg_delay=("Shipping_Delay", "mean"),
            delay_rate=("Is_Delayed", "mean"),
            total_orders=("Order_ID", "count"),
        )
        .round(2)
        .reset_index()
        .to_dict(orient="records")
    )

    product_stats = (
        df.groupby("Product_ID")
        .agg(
            avg_processing_time=("Order_Processing_Time", "mean"),
            avg_delay=("Shipping_Delay", "mean"),
        )
        .round(2)
        .reset_index()
        .to_dict(orient="records")
    )

    severity_counts = df["Delay_Severity"].value_counts().to_dict()

    df["week"] = df["Order_Date"].dt.to_period("W").astype(str)
    trend = df.groupby("week")["Shipping_Delay"].mean().round(2).reset_index()
    trend.columns = ["week", "avg_delay"]

    summary_json = {
        "total_rows": len(df),
        "warehouses": list(df["Warehouse_ID"].unique()),
        "products": list(df["Product_ID"].unique()),
        "overall_delay_rate": round(float(df["Is_Delayed"].mean()), 4),
        "avg_shipping_delay": round(float(df["Shipping_Delay"].mean()), 2),
        "avg_processing_time": round(float(df["Order_Processing_Time"].mean()), 2),
        "warehouse_stats": warehouse_stats,
        "product_stats": product_stats,
        "severity_counts": {
            "on_time": int(severity_counts.get("on_time", 0)),
            "minor": int(severity_counts.get("minor", 0)),
            "critical": int(severity_counts.get("critical", 0)),
        },
        "delay_trend": trend.to_dict(orient="records"),
    }

    return df, summary_json
