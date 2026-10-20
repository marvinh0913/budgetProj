"""Response models for affordability results."""

from datetime import date
from typing import Literal

from pydantic import BaseModel


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
