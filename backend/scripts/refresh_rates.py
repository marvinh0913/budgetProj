"""
Fetch the latest FRED rates and store them in the database.
Run from backend/:  python -m scripts.refresh_rates
"""

import sys

import psycopg

from app.config import get_settings
from app.services.fred import refresh_all


def main() -> int:
    settings = get_settings()
    with psycopg.connect(settings.database_url) as conn:
        failures = refresh_all(conn, settings.fred_api_key)
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
