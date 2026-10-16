"""
Tests for validation.py
Covers validate_transaction, validate_transactions_list,
validate_fred_response, and validate_interest_inputs
"""

from src.python.validation import (
    validate_transaction,
    validate_transactions_list,
    validate_fred_response,
    validate_interest_inputs,
)

# ─── validate_transaction ────────────────────────────────────────────────────


class TestValidateTransaction:
    """Tests for validate_transaction function"""

    def test_valid_expense_transaction(self):
        transaction = {"amount": 1500, "category": "rent", "type": "expense"}
        result = validate_transaction(transaction)
        assert result["valid"] is True

    def test_valid_income_transaction(self):
        transaction = {"amount": 3000, "category": "other", "type": "income"}
        result = validate_transaction(transaction)
        assert result["valid"] is True

    def test_missing_amount(self):
        transaction = {"category": "rent", "type": "expense"}
        result = validate_transaction(transaction)
        assert result["valid"] is False
        assert "amount" in result["error"]

    def test_missing_category(self):
        transaction = {"amount": 1500, "type": "expense"}
        result = validate_transaction(transaction)
        assert result["valid"] is False
        assert "category" in result["error"]

    def test_missing_type(self):
        transaction = {"amount": 1500, "category": "rent"}
        result = validate_transaction(transaction)
        assert result["valid"] is False
        assert "type" in result["error"]

    def test_negative_amount(self):
        transaction = {"amount": -100, "category": "rent", "type": "expense"}
        result = validate_transaction(transaction)
        assert result["valid"] is False
        assert "greater than zero" in result["error"]

    def test_zero_amount(self):
        transaction = {"amount": 0, "category": "rent", "type": "expense"}
        result = validate_transaction(transaction)
        assert result["valid"] is False
        assert "greater than zero" in result["error"]

    def test_invalid_type(self):
        transaction = {"amount": 1500, "category": "rent", "type": "invalid"}
        result = validate_transaction(transaction)
        assert result["valid"] is False
        assert "income" in result["error"]

    def test_invalid_category(self):
        transaction = {"amount": 1500, "category": "unknown", "type": "expense"}
        result = validate_transaction(transaction)
        assert result["valid"] is False
        assert "Invalid category" in result["error"]

    def test_not_a_dictionary(self):
        result = validate_transaction("not a dict")
        assert result["valid"] is False
        assert "dictionary" in result["error"]

    def test_amount_as_string(self):
        transaction = {"amount": "1500", "category": "rent", "type": "expense"}
        result = validate_transaction(transaction)
        assert result["valid"] is False
        assert "number" in result["error"]

    def test_valid_other_category(self):
        transaction = {"amount": 100, "category": "other", "type": "expense"}
        result = validate_transaction(transaction)
        assert result["valid"] is True


# ─── validate_transactions_list ──────────────────────────────────────────────


class TestValidateTransactionsList:
    """Tests for validate_transactions_list function"""

    def test_valid_list(self):
        transactions = [
            {"amount": 3000, "category": "other", "type": "income"},
            {"amount": 1500, "category": "rent", "type": "expense"},
            {"amount": 200, "category": "groceries", "type": "expense"},
        ]
        result = validate_transactions_list(transactions)
        assert result["valid"] is True

    def test_empty_list(self):
        result = validate_transactions_list([])
        assert result["valid"] is False
        assert "empty" in result["errors"][0]

    def test_not_a_list(self):
        result = validate_transactions_list("not a list")
        assert result["valid"] is False
        assert "list" in result["errors"][0]

    def test_one_invalid_transaction(self):
        transactions = [
            {"amount": 3000, "category": "other", "type": "income"},
            {"amount": -100, "category": "rent", "type": "expense"},
        ]
        result = validate_transactions_list(transactions)
        assert result["valid"] is False
        assert len(result["errors"]) == 1

    def test_multiple_invalid_transactions(self):
        transactions = [
            {"amount": -100, "category": "rent", "type": "expense"},
            {"amount": 0, "category": "groceries", "type": "expense"},
        ]
        result = validate_transactions_list(transactions)
        assert result["valid"] is False
        assert len(result["errors"]) == 2


# ─── validate_fred_response ──────────────────────────────────────────────────


class TestValidateFredResponse:
    """Tests for validate_fred_response function"""

    def test_valid_response(self):
        data = {
            "mortgage": 6.59,
            "federal_funds": 5.25,
            "credit_card": 21.47,
            "auto_loan": 7.89,
        }
        result = validate_fred_response(data)
        assert result["valid"] is True
        assert "rates" in result

    def test_none_response(self):
        result = validate_fred_response(None)
        assert result["valid"] is False
        assert "None" in result["error"]

    def test_not_a_dictionary(self):
        result = validate_fred_response("not a dict")
        assert result["valid"] is False
        assert "dictionary" in result["error"]

    def test_missing_rate_key(self):
        data = {
            "mortgage": 6.59,
            "federal_funds": 5.25,
            "credit_card": 21.47,
            # auto_loan missing
        }
        result = validate_fred_response(data)
        assert result["valid"] is False
        assert "auto_loan" in result["error"]

    def test_rate_out_of_range(self):
        data = {
            "mortgage": 50.0,  # way too high
            "federal_funds": 5.25,
            "credit_card": 21.47,
            "auto_loan": 7.89,
        }
        result = validate_fred_response(data)
        assert result["valid"] is False
        assert "mortgage" in result["error"]

    def test_rate_is_string(self):
        data = {
            "mortgage": "6.59",  # string instead of float
            "federal_funds": 5.25,
            "credit_card": 21.47,
            "auto_loan": 7.89,
        }
        result = validate_fred_response(data)
        assert result["valid"] is False
        assert "number" in result["error"]

    def test_validated_rates_returned(self):
        data = {
            "mortgage": 6.59,
            "federal_funds": 5.25,
            "credit_card": 21.47,
            "auto_loan": 7.89,
        }
        result = validate_fred_response(data)
        assert result["rates"]["mortgage"] == 6.59
        assert result["rates"]["federal_funds"] == 5.25
        assert result["rates"]["credit_card"] == 21.47
        assert result["rates"]["auto_loan"] == 7.89


# ─── validate_interest_inputs ────────────────────────────────────────────────


class TestValidateInterestInputs:
    """Tests for validate_interest_inputs function"""

    def test_valid_mortgage_inputs(self):
        data = {"loan_amount": 300000, "rate": 6.59, "term_years": 30}
        result = validate_interest_inputs(data, "mortgage")
        assert result["valid"] is True

    def test_valid_credit_card_inputs(self):
        data = {"balance": 5000, "rate": 21.47}
        result = validate_interest_inputs(data, "credit_card")
        assert result["valid"] is True

    def test_valid_auto_loan_inputs(self):
        data = {"principal": 25000, "rate": 7.89, "term_months": 60}
        result = validate_interest_inputs(data, "auto_loan")
        assert result["valid"] is True

    def test_valid_savings_inputs(self):
        data = {"principal": 1000, "monthly_deposit": 200, "rate": 5.25, "months": 12}
        result = validate_interest_inputs(data, "savings")
        assert result["valid"] is True

    def test_invalid_calculation_type(self):
        data = {"balance": 5000, "rate": 21.47}
        result = validate_interest_inputs(data, "invalid_type")
        assert result["valid"] is False
        assert "Invalid calculation type" in result["error"]

    def test_missing_required_field(self):
        data = {"rate": 6.59, "term_years": 30}  # missing loan_amount
        result = validate_interest_inputs(data, "mortgage")
        assert result["valid"] is False
        assert "loan_amount" in result["error"]

    def test_negative_value(self):
        data = {"loan_amount": -300000, "rate": 6.59, "term_years": 30}
        result = validate_interest_inputs(data, "mortgage")
        assert result["valid"] is False
        assert "positive" in result["error"]

    def test_invalid_term_months(self):
        data = {"principal": 25000, "rate": 7.89, "term_months": 100}
        result = validate_interest_inputs(data, "auto_loan")
        assert result["valid"] is False
        assert "term_months" in result["error"]

    def test_valid_all_term_months(self):
        for term in [24, 36, 48, 60, 72, 84]:
            data = {"principal": 25000, "rate": 7.89, "term_months": term}
            result = validate_interest_inputs(data, "auto_loan")
            assert result["valid"] is True

    def test_not_a_dictionary(self):
        result = validate_interest_inputs("not a dict", "mortgage")
        assert result["valid"] is False
        assert "dictionary" in result["error"]
