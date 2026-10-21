"""Response models for affordability results."""

from datetime import date
from typing import Literal
from decimal import Decimal

from pydantic import BaseModel, Field

from app.models.profile import ProfileRequest


class MortgageResult(BaseModel):
    max_home_price: float
    max_loan: float
    monthly_payment: float
    principal_and_interest: float
    taxes_and_insurance: float
    limited_by: Literal["housing_ratio", "debt_to_income"]
    rate: float
    term_years: int


class AutoResult(BaseModel):
    max_car_price: float
    max_loan: float
    monthly_payment: float
    recommended_down_payment: float
    limited_by: Literal["income_ratio", "debt_to_income"]
    rate: float
    term_months: int


class AffordabilityResponse(BaseModel):
    mortgage: MortgageResult
    auto: AutoResult
    rates_as_of: dict[str, date]


class EstimateRequest(ProfileRequest):
    """Profile fields plus loan options, for estimates without an account."""

    mortgage_term_years: int = Field(30, ge=10, le=30)
    auto_term_months: int = Field(48, ge=24, le=84)
    auto_down_payment: Decimal = Field(0, ge=0, max_digits=12, decimal_places=2)
