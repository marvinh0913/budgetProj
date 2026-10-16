"""
Edge case tests for BudgetProj Python calculations.
Tests unusual scenarios including empty data, zero values,
negative numbers, extreme values, and boundary conditions
across all calculation functions.
"""


from src.python.calculations import (
    calculate_total_income,
    calculate_total_expenses,
    calculate_remaining_balance,
    calculate_spending_by_category,
    calculate_category_percentages,
    calculate_group_totals,
    generate_budget_suggestions,
    get_budget_summary,
)
from src.python.interest import (
    calculate_mortgage_payment,
    calculate_credit_card_cost,
    calculate_auto_loan_payment,
    calculate_savings_growth,
)
from src.python.validation import (
    validate_transaction,
    validate_transactions_list,
    validate_fred_response,
)


# ─── Empty Data ───────────────────────────────────────────────────────────────

class TestEmptyData:
    """Tests for empty or missing data scenarios"""

    def test_empty_transactions_income(self):
        assert calculate_total_income([]) == 0

    def test_empty_transactions_expenses(self):
        assert calculate_total_expenses([]) == 0

    def test_empty_transactions_balance(self):
        assert calculate_remaining_balance([]) == 0

    def test_empty_transactions_by_category(self):
        assert calculate_spending_by_category([]) == {}

    def test_empty_transactions_percentages(self):
        assert calculate_category_percentages([]) == {}

    def test_empty_transactions_group_totals(self):
        result = calculate_group_totals([])
        assert result == {
            'essentials': 0,
            'wants': 0,
            'savings': 0,
            'other': 0,
        }

    def test_empty_transactions_suggestions(self):
        assert generate_budget_suggestions([]) == []

    def test_empty_transactions_summary_returns_error(self):
        result = get_budget_summary([])
        assert 'error' in result

    def test_empty_dict_transaction(self):
        result = validate_transaction({})
        assert result['valid'] is False

    def test_empty_fred_response(self):
        result = validate_fred_response({})
        assert result['valid'] is False


# ─── Zero Values ─────────────────────────────────────────────────────────────

class TestZeroValues:
    """Tests for zero value scenarios"""

    def test_zero_income_percentages_returns_empty(self):
        transactions = [
            {'amount': 500, 'category': 'rent', 'type': 'expense'},
        ]
        assert calculate_category_percentages(transactions) == {}

    def test_zero_income_suggestions_returns_empty(self):
        transactions = [
            {'amount': 500, 'category': 'rent', 'type': 'expense'},
        ]
        assert generate_budget_suggestions(transactions) == []

    def test_zero_amount_transaction_invalid(self):
        transaction = {'amount': 0, 'category': 'rent', 'type': 'expense'}
        result = validate_transaction(transaction)
        assert result['valid'] is False

    def test_zero_interest_mortgage(self):
        result = calculate_mortgage_payment(300000, 0, 30)
        assert result['monthly_payment'] == round(300000 / 360, 2)

    def test_zero_interest_auto_loan(self):
        result = calculate_auto_loan_payment(25000, 0, 60)
        assert result['monthly_payment'] == round(25000 / 60, 2)

    def test_zero_interest_savings(self):
        result = calculate_savings_growth(1000, 200, 0, 12)
        assert result['interest_earned'] == 0
        assert result['final_balance'] == result['total_deposited']

    def test_zero_principal_savings(self):
        result = calculate_savings_growth(0, 200, 5.25, 12)
        assert result['final_balance'] > 0
        assert result['total_deposited'] == round(200 * 12, 2)


# ─── Negative Values ─────────────────────────────────────────────────────────

class TestNegativeValues:
    """Tests for negative value scenarios"""

    def test_negative_amount_transaction_invalid(self):
        transaction = {'amount': -100, 'category': 'rent', 'type': 'expense'}
        result = validate_transaction(transaction)
        assert result['valid'] is False

    def test_negative_loan_amount_invalid(self):
        result = calculate_mortgage_payment(-300000, 6.59, 30)
        assert 'error' in result

    def test_negative_balance_credit_card_invalid(self):
        result = calculate_credit_card_cost(-5000, 21.47)
        assert 'error' in result

    def test_negative_principal_auto_loan_invalid(self):
        result = calculate_auto_loan_payment(-25000, 7.89, 60)
        assert 'error' in result

    def test_negative_principal_savings_invalid(self):
        result = calculate_savings_growth(-1000, 200, 5.25, 12)
        assert 'error' in result

    def test_negative_balance_remaining(self):
        transactions = [
            {'amount': 500, 'category': 'other', 'type': 'income'},
            {'amount': 1000, 'category': 'rent', 'type': 'expense'},
        ]
        result = calculate_remaining_balance(transactions)
        assert result == -500


# ─── Extreme Values ──────────────────────────────────────────────────────────

class TestExtremeValues:
    """Tests for very large or very small values"""

    def test_very_large_income(self):
        transactions = [
            {'amount': 1000000, 'category': 'other', 'type': 'income'},
        ]
        assert calculate_total_income(transactions) == 1000000

    def test_very_large_loan_amount(self):
        result = calculate_mortgage_payment(10000000, 6.59, 30)
        assert 'monthly_payment' in result
        assert result['monthly_payment'] > 0

    def test_very_small_amount(self):
        transaction = {'amount': 0.01, 'category': 'rent', 'type': 'expense'}
        result = validate_transaction(transaction)
        assert result['valid'] is True

    def test_large_credit_card_balance(self):
        result = calculate_credit_card_cost(100000, 21.47)
        assert result['annual_cost'] > 0
        assert 'error' not in result

    def test_many_transactions(self):
        transactions = [
            {'amount': 100, 'category': 'groceries', 'type': 'expense'}
            for _ in range(1000)
        ]
        transactions.append(
            {'amount': 500000, 'category': 'other', 'type': 'income'}
        )
        result = calculate_total_expenses(transactions)
        assert result == 100000

    def test_very_long_savings_period(self):
        result = calculate_savings_growth(1000, 200, 5.25, 360)
        assert result['final_balance'] > result['total_deposited']


# ─── Boundary Conditions ─────────────────────────────────────────────────────

class TestBoundaryConditions:
    """Tests for boundary and limit conditions"""

    def test_fred_rate_at_minimum_boundary(self):
        data = {
            'mortgage': 1.0,        # exactly at minimum
            'federal_funds': 0.0,   # exactly at minimum
            'credit_card': 5.0,     # exactly at minimum
            'auto_loan': 1.0,       # exactly at minimum
        }
        result = validate_fred_response(data)
        assert result['valid'] is True

    def test_fred_rate_at_maximum_boundary(self):
        data = {
            'mortgage': 20.0,       # exactly at maximum
            'federal_funds': 20.0,  # exactly at maximum
            'credit_card': 40.0,    # exactly at maximum
            'auto_loan': 25.0,      # exactly at maximum
        }
        result = validate_fred_response(data)
        assert result['valid'] is True

    def test_fred_rate_just_above_maximum(self):
        data = {
            'mortgage': 20.1,       # just above maximum
            'federal_funds': 5.25,
            'credit_card': 21.47,
            'auto_loan': 7.89,
        }
        result = validate_fred_response(data)
        assert result['valid'] is False

    def test_fred_rate_just_below_minimum(self):
        data = {
            'mortgage': 0.9,        # just below minimum
            'federal_funds': 5.25,
            'credit_card': 21.47,
            'auto_loan': 7.89,
        }
        result = validate_fred_response(data)
        assert result['valid'] is False

    def test_all_valid_auto_loan_terms(self):
        for term in [24, 36, 48, 60, 72, 84]:
            result = calculate_auto_loan_payment(25000, 7.89, term)
            assert 'error' not in result

    def test_invalid_auto_loan_term_just_outside_range(self):
        result = calculate_auto_loan_payment(25000, 7.89, 23)
        assert 'error' in result

    def test_single_transaction_list(self):
        transactions = [
            {'amount': 3000, 'category': 'other', 'type': 'income'}
        ]
        result = validate_transactions_list(transactions)
        assert result['valid'] is True


# ─── Mixed Valid and Invalid Data ─────────────────────────────────────────────

class TestMixedData:
    """Tests for lists containing both valid and invalid data"""

    def test_one_invalid_in_list(self):
        transactions = [
            {'amount': 3000, 'category': 'other', 'type': 'income'},
            {'amount': -100, 'category': 'rent', 'type': 'expense'},
            {'amount': 200, 'category': 'groceries', 'type': 'expense'},
        ]
        result = validate_transactions_list(transactions)
        assert result['valid'] is False
        assert len(result['errors']) == 1

    def test_all_invalid_in_list(self):
        transactions = [
            {'amount': -100, 'category': 'rent', 'type': 'expense'},
            {'amount': 0, 'category': 'groceries', 'type': 'expense'},
            {'amount': 200, 'category': 'unknown', 'type': 'expense'},
        ]
        result = validate_transactions_list(transactions)
        assert result['valid'] is False
        assert len(result['errors']) == 3

    def test_income_and_expenses_mixed(self):
        transactions = [
            {'amount': 5000, 'category': 'other', 'type': 'income'},
            {'amount': 1000, 'category': 'other', 'type': 'income'},
            {'amount': 500, 'category': 'rent', 'type': 'expense'},
            {'amount': 200, 'category': 'groceries', 'type': 'expense'},
        ]
        assert calculate_total_income(transactions) == 6000
        assert calculate_total_expenses(transactions) == 700
        assert calculate_remaining_balance(transactions) == 5300

    def test_only_income_no_expenses(self):
        transactions = [
            {'amount': 3000, 'category': 'other', 'type': 'income'},
        ]
        assert calculate_total_expenses(transactions) == 0
        assert calculate_spending_by_category(transactions) == {}
        assert calculate_remaining_balance(transactions) == 3000

    def test_only_expenses_no_income(self):
        transactions = [
            {'amount': 500, 'category': 'rent', 'type': 'expense'},
        ]
        assert calculate_total_income(transactions) == 0
        assert calculate_remaining_balance(transactions) == -500
