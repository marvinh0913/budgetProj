"""
Tests for interest.py
Covers mortgage, credit card, auto loan, and savings
calculation functions including affordability checks.
"""

import pytest

from src.python.interest import (
    calculate_mortgage_payment,
    calculate_mortgage_affordability,
    calculate_credit_card_cost,
    calculate_auto_loan_payment,
    calculate_savings_growth,
)

# ─── Sample Data ─────────────────────────────────────────────────────────────

SAMPLE_TRANSACTIONS = [
    {"amount": 5000, "category": "other", "type": "income"},
    {"amount": 500, "category": "groceries", "type": "expense"},
    {"amount": 200, "category": "utilities", "type": "expense"},
]

ZERO_INCOME_TRANSACTIONS = [
    {"amount": 500, "category": "rent", "type": "expense"},
]

HIGH_EXPENSE_TRANSACTIONS = [
    {"amount": 3000, "category": "other", "type": "income"},
    {"amount": 2500, "category": "rent", "type": "expense"},
]


# ─── calculate_mortgage_payment ───────────────────────────────────────────────


class TestCalculateMortgagePayment:
    """Tests for calculate_mortgage_payment function"""

    def test_basic_mortgage_payment(self):
        result = calculate_mortgage_payment(300000, 6.59, 30)
        assert "monthly_payment" in result
        assert "annual_payment" in result
        assert result["monthly_payment"] > 0
        assert result["annual_payment"] == pytest.approx(
            result["monthly_payment"] * 12, rel=1e-2
        )

    def test_monthly_less_than_annual(self):
        result = calculate_mortgage_payment(300000, 6.59, 30)
        assert result["monthly_payment"] < result["annual_payment"]

    def test_zero_interest_rate(self):
        result = calculate_mortgage_payment(300000, 0, 30)
        assert result["monthly_payment"] == round(300000 / 360, 2)

    def test_returns_loan_details(self):
        result = calculate_mortgage_payment(300000, 6.59, 30)
        assert result["loan_amount"] == 300000
        assert result["rate"] == 6.59
        assert result["term_years"] == 30
        assert result["total_payments"] == 360

    def test_invalid_inputs_returns_error(self):
        result = calculate_mortgage_payment(-300000, 6.59, 30)
        assert "error" in result

    def test_higher_rate_means_higher_payment(self):
        low_rate = calculate_mortgage_payment(300000, 3.0, 30)
        high_rate = calculate_mortgage_payment(300000, 7.0, 30)
        assert high_rate["monthly_payment"] > low_rate["monthly_payment"]

    def test_longer_term_means_lower_payment(self):
        short_term = calculate_mortgage_payment(300000, 6.59, 15)
        long_term = calculate_mortgage_payment(300000, 6.59, 30)
        assert long_term["monthly_payment"] < short_term["monthly_payment"]


# ─── calculate_mortgage_affordability ────────────────────────────────────────


class TestCalculateMortgageAffordability:
    """Tests for calculate_mortgage_affordability function"""

    def test_returns_affordability_details(self):
        result = calculate_mortgage_affordability(SAMPLE_TRANSACTIONS, 6.59, 30)
        assert "affordable_monthly_payment" in result
        assert "affordable_loan_amount" in result
        assert "max_by_28_rule" in result
        assert "max_by_36_rule" in result
        assert "message" in result

    def test_zero_income_returns_error(self):
        result = calculate_mortgage_affordability(ZERO_INCOME_TRANSACTIONS, 6.59, 30)
        assert "error" in result

    def test_high_expenses_returns_error(self):
        result = calculate_mortgage_affordability(HIGH_EXPENSE_TRANSACTIONS, 6.59, 30)
        assert "error" in result

    def test_affordable_payment_is_positive(self):
        result = calculate_mortgage_affordability(SAMPLE_TRANSACTIONS, 6.59, 30)
        assert result["affordable_monthly_payment"] > 0

    def test_affordable_loan_is_positive(self):
        result = calculate_mortgage_affordability(SAMPLE_TRANSACTIONS, 6.59, 30)
        assert result["affordable_loan_amount"] > 0

    def test_higher_income_means_higher_affordability(self):
        low_income = [
            {"amount": 3000, "category": "other", "type": "income"},
            {"amount": 200, "category": "groceries", "type": "expense"},
        ]
        high_income = [
            {"amount": 8000, "category": "other", "type": "income"},
            {"amount": 200, "category": "groceries", "type": "expense"},
        ]
        low_result = calculate_mortgage_affordability(low_income, 6.59, 30)
        high_result = calculate_mortgage_affordability(high_income, 6.59, 30)
        assert (
            high_result["affordable_loan_amount"] > low_result["affordable_loan_amount"]
        )


# ─── calculate_credit_card_cost ──────────────────────────────────────────────


class TestCalculateCreditCardCost:
    """Tests for calculate_credit_card_cost function"""

    def test_basic_credit_card_cost(self):
        result = calculate_credit_card_cost(5000, 21.47)
        assert "monthly_cost" in result
        assert "annual_cost" in result
        assert result["monthly_cost"] > 0
        assert result["annual_cost"] > 0

    def test_annual_is_twelve_times_monthly(self):
        result = calculate_credit_card_cost(5000, 21.47)
        assert result["annual_cost"] == pytest.approx(
            result["monthly_cost"] * 12, rel=1e-2
        )

    def test_returns_balance_and_rate(self):
        result = calculate_credit_card_cost(5000, 21.47)
        assert result["balance"] == 5000
        assert result["rate"] == 21.47

    def test_higher_balance_means_higher_cost(self):
        low_balance = calculate_credit_card_cost(1000, 21.47)
        high_balance = calculate_credit_card_cost(5000, 21.47)
        assert high_balance["annual_cost"] > low_balance["annual_cost"]

    def test_higher_rate_means_higher_cost(self):
        low_rate = calculate_credit_card_cost(5000, 15.0)
        high_rate = calculate_credit_card_cost(5000, 25.0)
        assert high_rate["annual_cost"] > low_rate["annual_cost"]

    def test_invalid_inputs_returns_error(self):
        result = calculate_credit_card_cost(-5000, 21.47)
        assert "error" in result

    def test_message_included(self):
        result = calculate_credit_card_cost(5000, 21.47)
        assert "message" in result
        assert "5000" in result["message"] or "5,000" in result["message"]


# ─── calculate_auto_loan_payment ─────────────────────────────────────────────


class TestCalculateAutoLoanPayment:
    """Tests for calculate_auto_loan_payment function"""

    def test_basic_auto_loan(self):
        result = calculate_auto_loan_payment(25000, 7.89, 60)
        assert "monthly_payment" in result
        assert "annual_payment" in result
        assert "total_cost" in result
        assert "total_interest" in result

    def test_total_cost_equals_payments_times_months(self):
        result = calculate_auto_loan_payment(25000, 7.89, 60)
        assert result["total_cost"] == pytest.approx(
            result["monthly_payment"] * 60, rel=1e-2
        )

    def test_total_interest_is_positive(self):
        result = calculate_auto_loan_payment(25000, 7.89, 60)
        assert result["total_interest"] > 0

    def test_zero_interest_rate(self):
        result = calculate_auto_loan_payment(25000, 0, 60)
        assert result["monthly_payment"] == round(25000 / 60, 2)

    def test_invalid_term_returns_error(self):
        result = calculate_auto_loan_payment(25000, 7.89, 100)
        assert "error" in result

    def test_all_valid_term_months(self):
        for term in [24, 36, 48, 60, 72, 84]:
            result = calculate_auto_loan_payment(25000, 7.89, term)
            assert "monthly_payment" in result

    def test_longer_term_means_lower_monthly_payment(self):
        short_term = calculate_auto_loan_payment(25000, 7.89, 36)
        long_term = calculate_auto_loan_payment(25000, 7.89, 72)
        assert long_term["monthly_payment"] < short_term["monthly_payment"]

    def test_longer_term_means_more_total_interest(self):
        short_term = calculate_auto_loan_payment(25000, 7.89, 36)
        long_term = calculate_auto_loan_payment(25000, 7.89, 72)
        assert long_term["total_interest"] > short_term["total_interest"]

    def test_invalid_inputs_returns_error(self):
        result = calculate_auto_loan_payment(-25000, 7.89, 60)
        assert "error" in result


# ─── calculate_savings_growth ─────────────────────────────────────────────────


class TestCalculateSavingsGrowth:
    """Tests for calculate_savings_growth function"""

    def test_basic_savings_growth(self):
        result = calculate_savings_growth(1000, 200, 5.25, 12)
        assert "final_balance" in result
        assert "total_deposited" in result
        assert "interest_earned" in result
        assert "annual_projection" in result

    def test_final_balance_greater_than_deposited(self):
        result = calculate_savings_growth(1000, 200, 5.25, 12)
        assert result["final_balance"] > result["total_deposited"]

    def test_interest_earned_is_positive(self):
        result = calculate_savings_growth(1000, 200, 5.25, 12)
        assert result["interest_earned"] > 0

    def test_total_deposited_calculation(self):
        result = calculate_savings_growth(1000, 200, 5.25, 12)
        assert result["total_deposited"] == round(1000 + (200 * 12), 2)

    def test_zero_interest_rate(self):
        result = calculate_savings_growth(1000, 200, 0, 12)
        assert result["final_balance"] == result["total_deposited"]
        assert result["interest_earned"] == 0

    def test_higher_rate_means_more_interest(self):
        low_rate = calculate_savings_growth(1000, 200, 2.0, 12)
        high_rate = calculate_savings_growth(1000, 200, 8.0, 12)
        assert high_rate["interest_earned"] > low_rate["interest_earned"]

    def test_more_months_means_higher_balance(self):
        short = calculate_savings_growth(1000, 200, 5.25, 12)
        long = calculate_savings_growth(1000, 200, 5.25, 24)
        assert long["final_balance"] > short["final_balance"]

    def test_invalid_inputs_returns_error(self):
        result = calculate_savings_growth(-1000, 200, 5.25, 12)
        assert "error" in result

    def test_message_included(self):
        result = calculate_savings_growth(1000, 200, 5.25, 12)
        assert "message" in result
