"""Affordability estimates: saved-profile and public versions."""

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.db import get_db
from app.dependencies import get_current_user_id
from app.models.affordability import AffordabilityResponse, EstimateRequest
from app.services.affordability import auto_affordability, mortgage_affordability
from app.services.rates import get_latest_rates

router = APIRouter(prefix="/affordability", tags=["affordability"])


def _require_rates(conn) -> dict:
    """Latest rates, or 503 if the ones we need haven't been fetched."""
    rates = get_latest_rates(conn)
    if "mortgage" not in rates or "auto_loan" not in rates:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Rate data is temporarily unavailable",
        )
    return rates


def _build_response(
    rates: dict,
    income: float,
    debts: float,
    savings: float,
    mortgage_term_years: int,
    auto_term_months: int,
    auto_down_payment: float,
) -> dict:
    return {
        "mortgage": mortgage_affordability(
            income,
            debts,
            savings,
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


@router.get("", response_model=AffordabilityResponse)
def get_affordability(
    mortgage_term_years: int = Query(30, ge=10, le=30),
    auto_term_months: int = Query(48, ge=24, le=84),
    auto_down_payment: float = Query(0, ge=0),
    user_id: int = Depends(get_current_user_id),
    conn=Depends(get_db),
):
    """
    Estimate affordability from the logged-in user's saved profile.
    Estimates only: excludes PMI, HOA fees, and credit-based rate
    differences. Not financial advice.
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

    return _build_response(
        _require_rates(conn),
        float(profile["gross_monthly_income"]),
        float(profile["monthly_debt_payments"]),
        float(profile["down_payment_savings"]),
        mortgage_term_years,
        auto_term_months,
        auto_down_payment,
    )


@router.post("/estimate", response_model=AffordabilityResponse)
def estimate_affordability(body: EstimateRequest, conn=Depends(get_db)):
    """
    Estimate affordability without an account. Nothing is stored.
    Estimates only: excludes PMI, HOA fees, and credit-based rate
    differences. Not financial advice.
    """
    return _build_response(
        _require_rates(conn),
        float(body.gross_monthly_income),
        float(body.monthly_debt_payments),
        float(body.down_payment_savings),
        body.mortgage_term_years,
        body.auto_term_months,
        float(body.auto_down_payment),
    )
