import jwt
import pytest

from app.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


def test_hash_is_not_the_password():
    assert hash_password("hunter2") != "hunter2"


def test_correct_password_verifies():
    hashed = hash_password("hunter2")
    assert verify_password("hunter2", hashed)


def test_wrong_password_fails():
    hashed = hash_password("hunter2")
    assert not verify_password("wrong", hashed)


def test_token_round_trip():
    token = create_access_token(42)
    assert decode_access_token(token) == 42


def test_tampered_token_rejected():
    token = create_access_token(42)
    with pytest.raises(jwt.InvalidTokenError):
        decode_access_token(token + "x")
