"""Read stored interest rates."""

from app.services.fred import SERIES

# FRED series ID -> app name, e.g. "MORTGAGE30US" -> "mortgage"
NAME_BY_SERIES = {series_id: name for name, series_id in SERIES.items()}


def get_latest_rates(conn) -> dict:
    """Return the newest stored value for each series, keyed by app name."""
    rows = conn.execute(
        """
        SELECT DISTINCT ON (series_id)
            series_id, rates_value, observation_date
        FROM rates
        ORDER BY series_id, observation_date DESC
        """
    ).fetchall()

    return {
        NAME_BY_SERIES[row["series_id"]]: {
            "series_id": row["series_id"],
            "value": float(row["rates_value"]),
            "observation_date": row["observation_date"],
        }
        for row in rows
        if row["series_id"] in NAME_BY_SERIES
    }
