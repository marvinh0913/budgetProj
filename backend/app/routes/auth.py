"""Register and login endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from psycopg.errors import UniqueViolation

from app.db import get_db
from app.models.auth import LoginRequest, RegisterRequest, TokenResponse
from app.security import create_access_token, hash_password, verify_password

from app.dependencies import get_current_user_id

router = APIRouter(prefix="/auth", tags=["auth"])

# Used when the email doesn't exist, so failed logins take the same time
# either way and don't reveal which emails have accounts.
DUMMY_HASH = hash_password("not-a-real-password")


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(body: RegisterRequest, conn=Depends(get_db)):
    try:
        row = conn.execute(
            "INSERT INTO users (email, password_hash) VALUES (%s, %s) RETURNING id",
            (body.email.lower(), hash_password(body.password)),
        ).fetchone()
    except UniqueViolation:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )
    return TokenResponse(access_token=create_access_token(row["id"]))


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, conn=Depends(get_db)):
    user = conn.execute(
        "SELECT id, password_hash FROM users WHERE lower(email) = %s",
        (body.email.lower(),),
    ).fetchone()

    password_hash = user["password_hash"] if user else DUMMY_HASH
    if not verify_password(body.password, password_hash) or user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    return TokenResponse(access_token=create_access_token(user["id"]))

@router.get("/me")
def me(user_id: int = Depends(get_current_user_id), conn=Depends(get_db)):
    user = conn.execute(
        "SELECT id, email, created_at FROM users WHERE id = %s",
        (user_id,),
    ).fetchone()
    if user is None:
        # Token is valid but the account was deleted
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user
