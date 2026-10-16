"""
BudgetProj API entry point.
Creates the FastAPI app and registers routes.
"""

from fastapi import FastAPI

app = FastAPI(title="BudgetProj API")


@app.get("/health")
def health_check():
    """Return a simple status so we can confirm the server is running."""
    return {"status": "ok"}
