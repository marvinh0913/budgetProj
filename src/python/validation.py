"""
Validation utilities.
Validates transactions, FRED API responses, and interest calculation inputs
before any calculations are performed.
"""

VALID_CATEGORIES = [
    "rent",
    "mortgage",
    "utilities",
    "groceries",
    "transportation",
    "insurance",
    "healthcare",
    "minimum_debt_payments",
    "dining",
    "entertainment",
    "shopping",
    "subscriptions",
    "travel",
    "personal_care",
    "hobbies",
    "savings",
    "investments",
    "emergency_fund",
    "retirement",
    "paycheck",
    "other",
]

VALID_TERM_MONTHS = [24, 36, 48, 60, 72, 84]

FRED_RATE_RANGES = {
    "mortgage": (1.0, 20.0),
    "federal_funds": (0.0, 20.0),
    "credit_card": (5.0, 40.0),
    "auto_loan": (1.0, 25.0),
}


def validate_transaction(transaction):
    """
    Validate a single transaction has required fields and valid values.

    Args:
        transaction (dict): Transaction with amount, category, and type

    Returns:
        dict: {'valid': True} or {'valid': False, 'error': 'reason'}
    """
    # Check transaction is a dictionary
    if not isinstance(transaction, dict):
        return {"valid": False, "error": "Transaction must be a dictionary"}

    # Check required fields exist
    required_fields = ["amount", "category", "type"]
    for field in required_fields:
        if field not in transaction:
            return {"valid": False, "error": f"Missing required field: {field}"}

    # Check amount is a positive number
    if not isinstance(transaction["amount"], (int, float)):
        return {"valid": False, "error": "Amount must be a number"}

    if transaction["amount"] <= 0:
        return {"valid": False, "error": "Amount must be greater than zero"}

    # Check type is valid
    if transaction["type"] not in ("income", "expense"):
        return {"valid": False, "error": "Type must be 'income' or 'expense'"}

    # Check category is valid
    if transaction["category"] not in VALID_CATEGORIES:
        return {"valid": False, "error": f"Invalid category: {transaction['category']}"}

    return {"valid": True}


def validate_transactions_list(transactions):
    """
    Validate a list of transactions.

    Args:
        transactions (list): List of transaction dictionaries

    Returns:
        dict: {'valid': True} or {'valid': False, 'errors': [...]}
    """
    # Check it's a list
    if not isinstance(transactions, list):
        return {"valid": False, "errors": ["Transactions must be a list"]}

    # Check it's not empty
    if len(transactions) == 0:
        return {"valid": False, "errors": ["Transactions list cannot be empty"]}

    # Validate each transaction
    errors = []
    for i, transaction in enumerate(transactions):
        result = validate_transaction(transaction)
        if not result["valid"]:
            errors.append(f'Transaction {i + 1}: {result["error"]}')

    if errors:
        return {"valid": False, "errors": errors}

    return {"valid": True}


def validate_fred_response(data):
    """
    Validate FRED API response before using rates in calculations.

    Args:
        data (dict): FRED response containing rate values

    Returns:
        dict: {'valid': True, 'rates': {...}} or {'valid': False, 'error': 'reason'}
    """
    # Check response exists
    if data is None:
        return {"valid": False, "error": "FRED response is None"}

    # Check response is a dictionary
    if not isinstance(data, dict):
        return {"valid": False, "error": "FRED response must be a dictionary"}

    # Check all required rate keys exist
    required_rates = ["mortgage", "federal_funds", "credit_card", "auto_loan"]
    for rate in required_rates:
        if rate not in data:
            return {"valid": False, "error": f"Missing rate: {rate}"}

    # Check each rate is a number and within realistic range
    validated_rates = {}
    for rate_key, (min_val, max_val) in FRED_RATE_RANGES.items():
        value = data[rate_key]

        if not isinstance(value, (int, float)):
            return {"valid": False, "error": f"{rate_key} rate must be a number"}

        if not (min_val <= value <= max_val):
            error_msg = (
                f"{rate_key} rate {value}% is outside "
                f"expected range ({min_val}% - {max_val}%)"
            )
            return {"valid": False, "error": error_msg}

        validated_rates[rate_key] = value

    return {"valid": True, "rates": validated_rates}


def validate_interest_inputs(data, calculation_type):
    """
    Validate inputs for interest calculations.

    Args:
        data (dict): Input values for the calculation
        calculation_type (str): One of 'mortgage', 'credit_card', 'auto_loan', 'savings'

    Returns:
        dict: {'valid': True} or {'valid': False, 'error': 'reason'}
    """
    # Check data is a dictionary
    if not isinstance(data, dict):
        return {"valid": False, "error": "Input data must be a dictionary"}

    # Required fields per calculation type
    required_fields = {
        "mortgage": ["loan_amount", "rate", "term_years"],
        "credit_card": ["balance", "rate"],
        "auto_loan": ["principal", "rate", "term_months"],
        "savings": ["principal", "monthly_deposit", "rate", "months"],
    }

    # Check calculation type is valid
    if calculation_type not in required_fields:
        return {
            "valid": False,
            "error": f"Invalid calculation type: {calculation_type}",
        }

    # Check required fields exist
    for field in required_fields[calculation_type]:
        if field not in data:
            return {"valid": False, "error": f"Missing required field: {field}"}

    # Check all values are positive numbers
    for field, value in data.items():
        if not isinstance(value, (int, float)):
            return {"valid": False, "error": f"{field} must be a number"}
        if value < 0:
            return {"valid": False, "error": f"{field} must be a positive number"}

    # Check term_months is valid for auto loans
    if calculation_type == "auto_loan":
        if data["term_months"] not in VALID_TERM_MONTHS:
            return {
                "valid": False,
                "error": f"term_months must be one of {VALID_TERM_MONTHS}",
            }

    return {"valid": True}
