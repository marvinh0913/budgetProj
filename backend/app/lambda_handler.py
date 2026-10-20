"""
AWS Lambda entry point.
Mangum translates Lambda Function URL events into ASGI requests for FastAPI.
"""

from mangum import Mangum

from app.main import app

handler = Mangum(app, lifespan="auto")
