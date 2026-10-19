"""
BudgetProj API entry point.
Creates the FastAPI app, configures CORS, and registers routes.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings

settings = get_settings()

app = FastAPI(title="BudgetProj API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.get("/health")
def health_check():
    """Return a simple status so we can confirm the server is running."""
    return {"status": "ok"}
