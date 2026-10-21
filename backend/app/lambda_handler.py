"""
AWS Lambda entry point.
Mangum translates Lambda Function URL events into ASGI requests for FastAPI.
"""

from mangum import Mangum

from app.db import pool
from app.main import app

# Open the pool once per Lambda container (on cold start), not per request.
# Mangum would otherwise run startup and shutdown around every invocation.
pool.open()

handler = Mangum(app, lifespan="off")
