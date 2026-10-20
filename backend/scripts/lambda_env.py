"""
Print Lambda environment settings as JSON, read from .env.production.
Used by:  aws lambda ... --environment "$(python -m scripts.lambda_env)"
"""

import json

from app.config import Settings

settings = Settings(_env_file=".env.production")

print(
    json.dumps(
        {
            "Variables": {
                "DATABASE_URL": settings.database_url,
                "JWT_SECRET": settings.jwt_secret,
                "FRED_API_KEY": settings.fred_api_key,
                "ENVIRONMENT": settings.environment,
            }
        }
    )
)
