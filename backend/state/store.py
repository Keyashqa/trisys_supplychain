import pandas as pd
from typing import Optional

enriched_df: Optional[pd.DataFrame] = None
summary_json: Optional[dict] = None


def set_data(df: pd.DataFrame, summary: dict) -> None:
    global enriched_df, summary_json
    enriched_df = df
    summary_json = summary


def get_data() -> tuple[Optional[pd.DataFrame], Optional[dict]]:
    return enriched_df, summary_json
