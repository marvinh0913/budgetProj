"""Affordability estimates for the logged-in user."""

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.db import get_db
from app.dependencies import get_current_user_id
from app.models.affordability import AffordabilityResponse
from app.services.affordability import auto_affordability, mortgage_affordability
from app.services.rates import get_latest_rates

router = APIRouter(prefix="/affordability", tags=["affordability"])


@router.get("", response_model=AffordabilityResponse)
def get_affordability(
    mortgage_term_years: int = Query(30, ge=15, le=30),
    auto_term_months: int = Query(48, ge=24, le=84),
    auto_down_payment: float = Query(0, ge=0),
    user_id: int = Depends(get_current_user_id),
    conn=Depends(get_db),
):
    """
    Estimate the most home and car the user can afford, using their profile
    and current FRED rates. Estimates only: excludes PMI, HOA fees, and
    credit-based rate differences. Not financial advice.
    """
    profile = conn.execute(
        """
        SELECT gross_monthly_income, monthly_debt_payments, down_payment_savings
        FROM financial_profiles WHERE user_id = %s
        """,
        (user_id,),
    ).fetchone()
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Create a profile first",
        )

    rates = get_latest_rates(conn)
    if "mortgage" not in rates or "auto_loan" not in rates:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Rate data is temporarily unavailable",
        )

    income = float(profile["gross_monthly_income"])
    debts = float(profile["monthly_debt_payments"])

    return {
        "mortgage": mortgage_affordability(
            income,
            debts,
            float(profile["down_payment_savings"]),
            rates["mortgage"]["value"],
            mortgage_term_years,
        ),
        "auto": auto_affordability(
            income,
            debts,
            auto_down_payment,
            rates["auto_loan"]["value"],
            auto_term_months,
        ),
        "rates_as_of": {
            "mortgage": rates["mortgage"]["observation_date"],
            "auto_loan": rates["auto_loan"]["observation_date"],
        },
    }
