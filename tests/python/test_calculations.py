"""
Tests for calculations.py
Covers all budget calculation functions including
income/expense totals, category breakdowns,
percentage calculations, and budget suggestions.
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

# ─── Sample Data ─────────────────────────────────────────────────────────────

SAMPLE_TRANSACTIONS = [
    {'amount': 3000, 'category': 'other', 'type': 'income'},
    {'amount': 1500, 'category': 'rent', 'type': 'expense'},
    {'amount': 200, 'category': 'groceries', 'type': 'expense'},
    {'amount': 100, 'category': 'dining', 'type': 'expense'},
    {'amount': 200, 'category': 'savings', 'type': 'expense'},
]

INCOME_ONLY = [
    {'amount': 3000, 'category': 'other', 'type': 'income'},
    {'amount': 1000, 'category': 'other', 'type': 'income'},
]

EXPENSES_ONLY = [
    {'amount': 1500, 'category': 'rent', 'type': 'expense'},
    {'amount': 200, 'category': 'groceries', 'type': 'expense'},
]


# ─── calculate_total_income ───────────────────────────────────────────────────

class TestCalculateTotalIncome:
    """Tests for calculate_total_income function"""

    def test_single_income(self):
        transactions = [{'amount': 3000, 'category': 'other', 'type': 'income'}]
        assert calculate_total_income(transactions) == 3000

    def test_multiple_income(self):
        assert calculate_total_income(INCOME_ONLY) == 4000

    def test_ignores_expenses(self):
        assert calculate_total_income(EXPENSES_ONLY) == 0

    def test_mixed_transactions(self):
        assert calculate_total_income(SAMPLE_TRANSACTIONS) == 3000

    def test_empty_list(self):
        assert calculate_total_income([]) == 0


# ─── calculate_total_expenses ─────────────────────────────────────────────────

class TestCalculateTotalExpenses:
    """Tests for calculate_total_expenses function"""

    def test_single_expense(self):
        transactions = [{'amount': 1500, 'category': 'rent', 'type': 'expense'}]
        assert calculate_total_expenses(transactions) == 1500

    def test_multiple_expenses(self):
        assert calculate_total_expenses(EXPENSES_ONLY) == 1700

    def test_ignores_income(self):
        assert calculate_total_expenses(INCOME_ONLY) == 0

    def test_mixed_transactions(self):
        assert calculate_total_expenses(SAMPLE_TRANSACTIONS) == 2000

    def test_empty_list(self):
        assert calculate_total_expenses([]) == 0


# ─── calculate_remaining_balance ─────────────────────────────────────────────

class TestCalculateRemainingBalance:
    """Tests for calculate_remaining_balance function"""

    def test_positive_balance(self):
        assert calculate_remaining_balance(SAMPLE_TRANSACTIONS) == 1000

    def test_zero_balance(self):
        transactions = [
            {'amount': 1000, 'category': 'other', 'type': 'income'},
            {'amount': 1000, 'category': 'rent', 'type': 'expense'},
        ]
        assert calculate_remaining_balance(transactions) == 0

    def test_negative_balance(self):
        transactions = [
            {'amount': 500, 'category': 'other', 'type': 'income'},
            {'amount': 1000, 'category': 'rent', 'type': 'expense'},
        ]
        assert calculate_remaining_balance(transactions) == -500

    def test_empty_list(self):
        assert calculate_remaining_balance([]) == 0

    def test_rounding(self):
        transactions = [
            {'amount': 1000.005, 'category': 'other', 'type': 'income'},
            {'amount': 500.003, 'category': 'rent', 'type': 'expense'},
        ]
        result = calculate_remaining_balance(transactions)
        assert result == round(1000.005 - 500.003, 2)


# ─── calculate_spending_by_category ──────────────────────────────────────────

class TestCalculateSpendingByCategory:
    """Tests for calculate_spending_by_category function"""

    def test_single_category(self):
        transactions = [
            {'amount': 1500, 'category': 'rent', 'type': 'expense'},
        ]
        result = calculate_spending_by_category(transactions)
        assert result == {'rent': 1500}

    def test_multiple_categories(self):
        result = calculate_spending_by_category(SAMPLE_TRANSACTIONS)
        assert result == {
            'rent': 1500,
            'groceries': 200,
            'dining': 100,
            'savings': 200,
        }

    def test_same_category_accumulates(self):
        transactions = [
            {'amount': 100, 'category': 'groceries', 'type': 'expense'},
            {'amount': 200, 'category': 'groceries', 'type': 'expense'},
        ]
        result = calculate_spending_by_category(transactions)
        assert result == {'groceries': 300}

    def test_ignores_income(self):
        result = calculate_spending_by_category(INCOME_ONLY)
        assert result == {}

    def test_empty_list(self):
        result = calculate_spending_by_category([])
        assert result == {}


# ─── calculate_category_percentages ──────────────────────────────────────────

class TestCalculateCategoryPercentages:
    """Tests for calculate_category_percentages function"""

    def test_basic_percentages(self):
        transactions = [
            {'amount': 1000, 'category': 'other', 'type': 'income'},
            {'amount': 500, 'category': 'rent', 'type': 'expense'},
        ]
        result = calculate_category_percentages(transactions)
        assert result == {'rent': 50.0}

    def test_multiple_categories(self):
        result = calculate_category_percentages(SAMPLE_TRANSACTIONS)
        assert result['rent'] == 50.0
        assert result['groceries'] == round((200 / 3000) * 100, 2)

    def test_zero_income_returns_empty(self):
        result = calculate_category_percentages(EXPENSES_ONLY)
        assert result == {}

    def test_empty_list_returns_empty(self):
        result = calculate_category_percentages([])
        assert result == {}


# ─── calculate_group_totals ───────────────────────────────────────────────────

class TestCalculateGroupTotals:
    """Tests for calculate_group_totals function"""

    def test_correct_group_assignment(self):
        result = calculate_group_totals(SAMPLE_TRANSACTIONS)
        assert result['essentials'] == 1700   # rent + groceries
        assert result['wants'] == 100          # dining
        assert result['savings'] == 200        # savings
        assert result['other'] == 0

    def test_empty_list(self):
        result = calculate_group_totals([])
        assert result == {
            'essentials': 0,
            'wants': 0,
            'savings': 0,
            'other': 0
        }

    def test_ignores_income(self):
        result = calculate_group_totals(INCOME_ONLY)
        assert result == {
            'essentials': 0,
            'wants': 0,
            'savings': 0,
            'other': 0
        }


# ─── generate_budget_suggestions ─────────────────────────────────────────────

class TestGenerateBudgetSuggestions:
    """Tests for generate_budget_suggestions function"""

    def test_overspending_generates_suggestion(self):
        # rent alone is 50% which is at the limit
        # adding groceries pushes essentials over 50%
        transactions = [
            {'amount': 3000, 'category': 'other', 'type': 'income'},
            {'amount': 1500, 'category': 'rent', 'type': 'expense'},
            {'amount': 200, 'category': 'groceries', 'type': 'expense'},
        ]
        result = generate_budget_suggestions(transactions)
        groups = [s['group'] for s in result]
        assert 'essentials' in groups

    def test_suggestion_contains_required_fields(self):
        transactions = [
            {'amount': 3000, 'category': 'other', 'type': 'income'},
            {'amount': 2000, 'category': 'rent', 'type': 'expense'},
        ]
        result = generate_budget_suggestions(transactions)
        assert len(result) > 0
        suggestion = result[0]
        assert 'group' in suggestion
        assert 'current_amount' in suggestion
        assert 'current_percentage' in suggestion
        assert 'recommended_percentage' in suggestion
        assert 'recommended_amount' in suggestion
        assert 'difference' in suggestion
        assert 'message' in suggestion

    def test_no_suggestions_when_within_targets(self):
        transactions = [
            {'amount': 3000, 'category': 'other', 'type': 'income'},
            {'amount': 500, 'category': 'rent', 'type': 'expense'},
            {'amount': 200, 'category': 'dining', 'type': 'expense'},
            {'amount': 100, 'category': 'savings', 'type': 'expense'},
        ]
        result = generate_budget_suggestions(transactions)
        assert result == []

    def test_zero_income_returns_empty(self):
        result = generate_budget_suggestions(EXPENSES_ONLY)
        assert result == []


# ─── get_budget_summary ───────────────────────────────────────────────────────

class TestGetBudgetSummary:
    """Tests for get_budget_summary function"""

    def test_returns_complete_summary(self):
        result = get_budget_summary(SAMPLE_TRANSACTIONS)
        assert 'total_income' in result
        assert 'total_expenses' in result
        assert 'remaining_balance' in result
        assert 'spending_by_category' in result
        assert 'category_percentages' in result
        assert 'group_totals' in result
        assert 'suggestions' in result

    def test_correct_totals(self):
        result = get_budget_summary(SAMPLE_TRANSACTIONS)
        assert result['total_income'] == 3000
        assert result['total_expenses'] == 2000
        assert result['remaining_balance'] == 1000

    def test_invalid_transactions_returns_error(self):
        invalid = [{'amount': -100, 'category': 'rent', 'type': 'expense'}]
        result = get_budget_summary(invalid)
        assert 'error' in result

    def test_empty_list_returns_error(self):
        result = get_budget_summary([])
        assert 'error' in result
