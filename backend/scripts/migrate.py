"""
Apply SQL migrations in backend/migrations/ in filename order.
Each file runs once; applied files are recorded in schema_migrations.

Run from backend/:  python -m scripts.migrate
"""

from pathlib import Path

import psycopg

from app.config import get_settings

MIGRATIONS_DIR = Path(__file__).resolve().parent.parent / "migrations"


def main():
    files = sorted(MIGRATIONS_DIR.glob("*.sql"))

    with psycopg.connect(get_settings().database_url, autocommit=True) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS schema_migrations (
                filename   TEXT PRIMARY KEY,
                applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
            )
            """
        )

        applied = {
            row[0] for row in conn.execute(
                "SELECT filename FROM schema_migrations"
                )
        }

        for path in files:
            if path.name in applied:
                print(f"skip     {path.name}")
                continue

            # One transaction per file: all of it applies, or none of it does
            with conn.transaction():
                conn.execute(path.read_text())
                conn.execute(
                    "INSERT INTO schema_migrations (filename) VALUES (%s)",
                    (path.name,),
                )
            print(f"applied  {path.name}")


if __name__ == "__main__":
    main()
