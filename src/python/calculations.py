"""
Budget calculation utilities
Handles income/expense totals, category breakdowns,
percentage calculations, and budget suggestions based
on the 50/30/20 rule.
"""

from src.python.validation import validate_transactions_list

ESSENTIALS = [
    "rent",
    "mortgage",
    "utilities",
    "groceries",
    "transportation",
    "insurance",
    "healthcare",
    "minimum_debt_payments",
]

WANTS = [
    "dining",
    "entertainment",
    "shopping",
    "subscriptions",
    "travel",
    "personal_care",
    "hobbies",
]

SAVINGS = [
    "savings",
    "investments",
    "emergency_fund",
    "retirement",
]

# 50/30/20 rule targets
BUDGET_TARGETS = {
    "essentials": 50.0,
    "wants": 30.0,
    "savings": 20.0,
}


def calculate_total_income(transactions):
    """
    Calculate total income from a list of transactions.

    Args:
        transactions (list): List of validated transaction dictionaries

    Returns:
        float: Total income amount
    """
    total = 0
    for t in transactions:
        if t["type"] == "income":
            total += t["amount"]
    return total


def calculate_total_expenses(transactions):
    """
    Calculate total expenses from a list of transactions.

    Args:
        transactions (list): List of validated transaction dictionaries

    Returns:
        float: Total expenses amount
    """
    total = 0
    for t in transactions:
        if t["type"] == "expense":
            total += t["amount"]
    return total


def calculate_remaining_balance(transactions):
    """
    Calculate remaining balance after expenses.

    Args:
        transactions (list): List of validated transaction dictionaries

    Returns:
        float: Remaining balance (income - expenses)
    """
    total_income = calculate_total_income(transactions)
    total_expenses = calculate_total_expenses(transactions)
    balance = round(total_income - total_expenses, 2)
    return balance


def calculate_spending_by_category(transactions):
    """
    Group expenses by category and calculate totals.

    Args:
        transactions (list): List of validated transaction dictionaries

    Returns:
        dict: Category names mapped to total spending amounts
    """
    categories = {}
    for t in transactions:
        if t["type"] == "expense":
            category = t["category"]
            categories[category] = categories.get(category, 0) + t["amount"]

    # Round all values
    rounded = {}
    for k, v in categories.items():
        rounded[k] = round(v, 2)
    return rounded


def calculate_category_percentages(transactions):
    """
    Calculate each expense category as a percentage of total income.

    Args:
        transactions (list): List of validated transaction dictionaries

    Returns:
        dict: Category names mapped to percentage of total income
              Returns empty dict if total income is zero
    """
    total_income = calculate_total_income(transactions)

    if total_income == 0:
        return {}

    spending = calculate_spending_by_category(transactions)

    percentages = {}
    for category, amount in spending.items():
        percentages[category] = round((amount / total_income) * 100, 2)
    return percentages


def _get_category_group(category):
    """
    Determine which 50/30/20 group a category belongs to.

    Args:
        category (str): Category name

    Returns:
        str: 'essentials', 'wants', 'savings', or 'other'
    """
    if category in ESSENTIALS:
        return "essentials"
    if category in WANTS:
        return "wants"
    if category in SAVINGS:
        return "savings"
    return "other"


def calculate_group_totals(transactions):
    """
    Calculate total spending per 50/30/20 group.

    Args:
        transactions (list): List of validated transaction dictionaries

    Returns:
        dict: Group names mapped to total spending amounts
    """
    groups = {"essentials": 0, "wants": 0, "savings": 0, "other": 0}

    for t in transactions:
        if t["type"] == "expense":
            group = _get_category_group(t["category"])
            groups[group] += t["amount"]

    rounded = {}
    for k, v in groups.items():
        rounded[k] = round(v, 2)
    return rounded


def generate_budget_suggestions(transactions):
    """
    Generate budget suggestions based on the 50/30/20 rule.
    Compares actual spending groups to recommended targets
    and returns actionable suggestions with exact dollar amounts.

    Args:
        transactions (list): List of validated transaction dictionaries

    Returns:
        list: List of suggestion dictionaries, empty if no suggestions needed
    """
    total_income = calculate_total_income(transactions)

    if total_income == 0:
        return []

    group_totals = calculate_group_totals(transactions)
    suggestions = []

    for group, target_pct in BUDGET_TARGETS.items():
        actual_amount = group_totals.get(group, 0)
        actual_pct = round((actual_amount / total_income) * 100, 2)
        recommended_amount = round((target_pct / 100) * total_income, 2)
        difference = round(actual_amount - recommended_amount, 2)

        if actual_pct > target_pct:
            suggestions.append(
                {
                    "group": group,
                    "current_amount": actual_amount,
                    "current_percentage": actual_pct,
                    "recommended_percentage": target_pct,
                    "recommended_amount": recommended_amount,
                    "difference": difference,
                    "message": (
                        f"Your {group} spending is {actual_pct}% of income "
                        f"(${actual_amount:.2f}). Consider reducing by "
                        f"${difference:.2f} to reach the recommended "
                        f"{target_pct}% (${recommended_amount:.2f})."
                    ),
                }
            )

    return suggestions


def get_budget_summary(transactions):
    """
    Generate a complete budget summary combining all calculations.

    Args:
        transactions (list): List of validated transaction dictionaries

    Returns:
        dict: Complete budget summary or error if validation fails
    """
    # Validate transactions first
    validation = validate_transactions_list(transactions)
    if not validation["valid"]:
        return {"error": validation["errors"]}

    return {
        "total_income": calculate_total_income(transactions),
        "total_expenses": calculate_total_expenses(transactions),
        "remaining_balance": calculate_remaining_balance(transactions),
        "spending_by_category": calculate_spending_by_category(transactions),
        "category_percentages": calculate_category_percentages(transactions),
        "group_totals": calculate_group_totals(transactions),
        "suggestions": generate_budget_suggestions(transactions),
    }
