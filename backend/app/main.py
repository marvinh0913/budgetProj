"""
BudgetProj API entry point.
Creates the FastAPI app, configures CORS, and registers routes.
"""

from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.db import get_db, pool

from app.routes import auth

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    pool.open()  # runs once at startup
    yield  # the app serves requests here
    pool.close()  # runs once at shutdown


app = FastAPI(title="BudgetProj API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth.router)


@app.get("/health")
def health_check():
    """Confirm the server is running (doesn't touch the database)."""
    return {"status": "ok"}


@app.get("/health/db")
def health_db(conn=Depends(get_db)):
    """Confirm the API can reach the database."""
    conn.execute("SELECT 1")
    return {"database": "ok"}
