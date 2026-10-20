"""
Database connection pool and a FastAPI dependency for route handlers.
"""

from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

from app.config import get_settings

pool = ConnectionPool(
    conninfo=get_settings().database_url,
    min_size=1,
    max_size=2,  # each Lambda instance handles one request at a time
    kwargs={"row_factory": dict_row},
    check=ConnectionPool.check_connection,  # discard connections that went stale
    open=False,
)


def get_db():
    """
    Lend a connection to one request.
    Commits if the request succeeds, rolls back if it raises.
    """
    with pool.connection() as conn:
        yield conn
