"""Request and response models for the financial profile."""

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field

Money = Field(ge=0, max_digits=12, decimal_places=2)


class ProfileRequest(BaseModel):
    gross_monthly_income: Decimal = Money
    monthly_debt_payments: Decimal = Money
    down_payment_savings: Decimal = Money


class ProfileResponse(BaseModel):
    gross_monthly_income: float
    monthly_debt_payments: float
    down_payment_savings: float
    updated_at: datetime
