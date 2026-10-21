"""
Lambda entry points for scheduled jobs (not HTTP requests).
"""

import psycopg

from app.config import get_settings
from app.services.fred import refresh_all


def refresh_rates_handler(event, context):
    """Triggered on a schedule by EventBridge Scheduler."""
    settings = get_settings()
    with psycopg.connect(settings.database_url) as conn:
        failures = refresh_all(conn, settings.fred_api_key)

    if failures:
        # Raising marks the invocation as failed, so it shows up in monitoring
        raise RuntimeError(f"{failures} rate series failed to refresh")
    return {"status": "ok"}
