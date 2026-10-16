"""
Application settings loaded from environment variables.
In local development, values come from backend/.env.
On Cloud Run, they come from the service's environment/secrets.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Required: the app refuses to start if these are missing
    database_url: str
    jwt_secret: str
    fred_api_key: str

    # Optional, with defaults
    environment: str = "development"
    allowed_origins: list[str] = [
        "http://localhost:5173",
        "https://marvinh0913.github.io",
    ]
    jwt_expire_minutes: int = 60


@lru_cache
def get_settings() -> Settings:
    """Load settings once and reuse the same object everywhere."""
    return Settings()
