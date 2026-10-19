"""
Password hashing and JWT helpers.
No HTTP or database code here, so these are easy to test on their own.
"""

from datetime import datetime, timedelta, timezone

import jwt
from pwdlib import PasswordHash

from app.config import get_settings

password_hasher = PasswordHash.recommended()  # Argon2 with safe defaults
ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    """Return a salted hash to store instead of the password."""
    return password_hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    """Check a login attempt against the stored hash."""
    return password_hasher.verify(password, password_hash)


def create_access_token(user_id: int) -> str:
    """Create a signed token that identifies the user until it expires."""
    settings = get_settings()
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),  # "subject": who the token is for
        "iat": now,  # issued at
        "exp": now + timedelta(minutes=settings.jwt_expire_minutes),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=ALGORITHM)


def decode_access_token(token: str) -> int:
    """
    Return the user ID from a valid token.
    Raises jwt.InvalidTokenError if it's expired, tampered with, or malformed.
    """
    settings = get_settings()
    payload = jwt.decode(token, settings.jwt_secret, algorithms=[ALGORITHM])
    return int(payload["sub"])
