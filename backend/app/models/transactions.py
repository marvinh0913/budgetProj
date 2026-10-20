"""Request and response models for transactions."""

from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field


class TransactionCreate(BaseModel):
    transaction_type: Literal["income", "expense"]
    category: str = Field(min_length=1, max_length=50)
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    transaction_date: date | None = None  # defaults to today


class TransactionResponse(BaseModel):
    id: int
    transaction_type: Literal["income", "expense"]
    category: str
    amount: float
    transaction_date: date
    created_at: datetime
