import pytest

from app.services.affordability import (
    auto_affordability,
    max_loan,
    mortgage_affordability,
)


def test_max_loan_known_value():
    # $1,000/month at 6% for 30 years repays about $166,791.61
    assert max_loan(1000, 6.0, 360) == pytest.approx(166_791.61, abs=1)


def test_max_loan_zero_rate():
    assert max_loan(1000, 0.0, 48) == pytest.approx(48_000)


def test_mortgage_payment_hits_housing_limit():
    result = mortgage_affordability(
        income=6000, debts=0, down_payment=40000, annual_rate=6.5
    )
    assert result["monthly_payment"] == pytest.approx(0.28 * 6000, abs=0.05)
    assert result["limited_by"] == "housing_ratio"
    assert result["max_home_price"] == pytest.approx(
        result["max_loan"] + 40000, abs=0.01
    )


def test_mortgage_limited_by_debt():
    # 36% of 6000 = 2160; minus 1500 in debts leaves 660, below the 28% limit of 1680
    result = mortgage_affordability(
        income=6000, debts=1500, down_payment=0, annual_rate=6.5
    )
    assert result["limited_by"] == "debt_to_income"
    assert result["monthly_payment"] == pytest.approx(660, abs=0.05)


def test_mortgage_with_too_much_debt():
    result = mortgage_affordability(
        income=3000, debts=2000, down_payment=10000, annual_rate=6.5
    )
    assert result["max_loan"] == 0
    assert result["max_home_price"] == 0


def test_auto_zero_rate():
    result = auto_affordability(
        income=6000, debts=0, down_payment=0, annual_rate=0, term_months=48
    )
    assert result["monthly_payment"] == 600
    assert result["max_loan"] == pytest.approx(28_800)
    assert result["recommended_down_payment"] == pytest.approx(5_760)
