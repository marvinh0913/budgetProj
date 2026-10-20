"""Financial profile endpoints for the logged-in user."""

from fastapi import APIRouter, Depends, HTTPException, status

from app.db import get_db
from app.dependencies import get_current_user_id
from app.models.profile import ProfileRequest, ProfileResponse

router = APIRouter(prefix="/profile", tags=["profile"])

PROFILE_COLUMNS = (
    "gross_monthly_income, monthly_debt_payments, down_payment_savings, updated_at"
)


@router.get("", response_model=ProfileResponse)
def get_profile(user_id: int = Depends(get_current_user_id), conn=Depends(get_db)):
    profile = conn.execute(
        f"SELECT {PROFILE_COLUMNS} FROM financial_profiles WHERE user_id = %s",
        (user_id,),
    ).fetchone()
    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No profile yet"
        )
    return profile


@router.put("", response_model=ProfileResponse)
def put_profile(
    body: ProfileRequest,
    user_id: int = Depends(get_current_user_id),
    conn=Depends(get_db),
):
    return conn.execute(
        f"""
        INSERT INTO financial_profiles
            (user_id, gross_monthly_income, monthly_debt_payments, down_payment_savings)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (user_id) DO UPDATE SET
            gross_monthly_income  = EXCLUDED.gross_monthly_income,
            monthly_debt_payments = EXCLUDED.monthly_debt_payments,
            down_payment_savings  = EXCLUDED.down_payment_savings,
            updated_at            = now()
        RETURNING {PROFILE_COLUMNS}
        """,
        (
            user_id,
            body.gross_monthly_income,
            body.monthly_debt_payments,
            body.down_payment_savings,
        ),
    ).fetchone()
