"""Fetch interest rates from the FRED API and store them."""

from datetime import date
from decimal import Decimal

import httpx

FRED_URL = "https://api.stlouisfed.org/fred/series/observations"

# App name -> FRED series ID (same series as the frontend's fetchRates.js)
SERIES = {
    "mortgage": "MORTGAGE30US",
    "federal_funds": "FEDFUNDS",
    "credit_card": "TERMCBCCALLNS",
    "auto_loan": "TERMCBAUTO48NS",
}


def fetch_latest(series_id: str, api_key: str) -> tuple[date, Decimal] | None:
    """Return (observation_date, value) for the most recent reported value."""
    response = httpx.get(
        FRED_URL,
        params={
            "series_id": series_id,
            "api_key": api_key,
            "file_type": "json",
            "sort_order": "desc",
            "limit": 10,
        },
        timeout=10,
    )
    response.raise_for_status()

    for obs in response.json()["observations"]:
        if obs["value"] != ".":  # FRED uses "." for missing values
            return date.fromisoformat(obs["date"]), Decimal(obs["value"])
    return None


def save_rate(conn, series_id: str, observation_date: date, value: Decimal) -> None:
    """Insert a rate, or update it if FRED revised that date's value."""
    conn.execute(
        """
        INSERT INTO rates (series_id, rates_value, observation_date)
        VALUES (%s, %s, %s)
        ON CONFLICT (series_id, observation_date) DO UPDATE SET
            rates_value = EXCLUDED.rates_value,
            fetched_at  = now()
        """,
        (series_id, value, observation_date),
    )
