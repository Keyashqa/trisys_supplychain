from __future__ import annotations
from typing import Literal
from pydantic import BaseModel


class DataContext(BaseModel):
    question_intent: str
    result_summary: dict
    rows_analyzed: int
    top_entities: list[dict]
    anomalies_detected: list[str]


class AnalysisResult(BaseModel):
    key_finding: str
    supporting_evidence: list[str]
    pattern_detected: str | None
    anomaly_flag: bool
    confidence: Literal["high", "medium", "low"]
    chart_type: Literal["bar", "line", "scatter", "none"]
    chart_data_key: str
    generated_insight: str


class ChartInstruction(BaseModel):
    chart_type: str
    x_key: str
    y_key: str
    title: str
    chart_data_key: str


class FinalAnswer(BaseModel):
    answer: str
    recommendation: str
    follow_ups: list[str]
    chart_instruction: ChartInstruction | None


class AskRequest(BaseModel):
    question: str


class UploadResponse(BaseModel):
    status: str
    rows_loaded: int
    warehouses_found: list[str]
    insights_vectorized: int
    summary: dict
