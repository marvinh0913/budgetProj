"""
Fetch the latest FRED rates and store them in the database.
Run from backend/:  python -m scripts.refresh_rates
"""

import sys

import httpx
import psycopg

from app.config import get_settings
from app.services.fred import SERIES, fetch_latest, save_rate


def main() -> int:
    settings = get_settings()
    failures = 0

    with psycopg.connect(settings.database_url) as conn:
        for name, series_id in SERIES.items():
            try:
                result = fetch_latest(series_id, settings.fred_api_key)
            except httpx.HTTPStatusError as exc:
                print(f"FAILED   {series_id}: HTTP {exc.response.status_code}")
                failures += 1
                continue
            except httpx.RequestError as exc:
                print(f"FAILED   {series_id}: {type(exc).__name__}")
                failures += 1
                continue

            if result is None:
                print(f"NO DATA  {series_id}")
                continue

            observation_date, value = result
            save_rate(conn, series_id, observation_date, value)
            print(f"saved    {name:<14} {series_id:<16} {value} ({observation_date})")

    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
