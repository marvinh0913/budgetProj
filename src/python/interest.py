"""
Interest and loan calculation utilities.
Handles mortgage, credit card, auto loan, and savings
calculations using real-time FRED API rate data.
All calculations return both monthly and annual costs.
"""

from src.python.validation import validate_interest_inputs

# 28/36 rule targets for mortgage affordability
MORTGAGE_PAYMENT_LIMIT = 28.0  # monthly payment max % of gross income
TOTAL_DEBT_LIMIT = 36.0  # total debt max % of gross income


def calculate_mortgage_payment(loan_amount, rate, term_years):
    """
    Calculate monthly and annual mortgage payment using
    the standard amortization formula.

    Args:
        loan_amount (float): Total loan amount in dollars
        rate (float): Annual interest rate as a percentage (e.g. 6.59)
        term_years (int): Loan term in years

    Returns:
        dict: Monthly and annual payment amounts or error
    """
    validation = validate_interest_inputs(
        {"loan_amount": loan_amount, "rate": rate, "term_years": term_years}, "mortgage"
    )
    if not validation["valid"]:
        return {"error": validation["error"]}

    # Convert annual rate to monthly decimal
    monthly_rate = (rate / 100) / 12
    total_payments = term_years * 12

    # Handle zero interest rate edge case
    if monthly_rate == 0:
        monthly_payment = loan_amount / total_payments
    else:
        # Standard amortization formula
        monthly_payment = (
            loan_amount
            * (monthly_rate * (1 + monthly_rate) ** total_payments)
            / ((1 + monthly_rate) ** total_payments - 1)
        )

    annual_payment = monthly_payment * 12

    return {
        "monthly_payment": round(monthly_payment, 2),
        "annual_payment": round(annual_payment, 2),
        "loan_amount": loan_amount,
        "rate": rate,
        "term_years": term_years,
        "total_payments": total_payments,
    }


def calculate_mortgage_affordability(transactions, rate, term_years):
    """
    Calculate affordable mortgage amount based on income and
    existing expenses using the 28/36 rule.

    Args:
        transactions (list): List of validated transaction dictionaries
        rate (float): Annual interest rate as a percentage
        term_years (int): Loan term in years

    Returns:
        dict: Affordability details including max payment and loan amount
    """
    from src.python.calculations import (
        calculate_total_income,
        calculate_total_expenses,
    )

    total_income = calculate_total_income(transactions)
    total_expenses = calculate_total_expenses(transactions)

    if total_income == 0:
        return {"error": "No income found in transactions"}

    # 28% rule — max monthly mortgage payment
    max_mortgage_payment = round((MORTGAGE_PAYMENT_LIMIT / 100) * total_income, 2)

    # 36% rule — max total debt including existing expenses
    max_total_debt = round((TOTAL_DEBT_LIMIT / 100) * total_income, 2)
    max_payment_after_debts = round(max_total_debt - total_expenses, 2)

    # Use the lower of the two limits
    affordable_payment = min(max_mortgage_payment, max_payment_after_debts)

    if affordable_payment <= 0:
        return {
            "error": "Current expenses exceed the 36% debt limit",
            "total_income": total_income,
            "total_expenses": total_expenses,
            "max_total_debt": max_total_debt,
        }

    # Work backwards to find affordable loan amount
    monthly_rate = (rate / 100) / 12
    total_payments = term_years * 12

    if monthly_rate == 0:
        affordable_loan = affordable_payment * total_payments
    else:
        affordable_loan = affordable_payment * (
            ((1 + monthly_rate) ** total_payments - 1)
            / (monthly_rate * (1 + monthly_rate) ** total_payments)
        )

    return {
        "affordable_monthly_payment": affordable_payment,
        "affordable_loan_amount": round(affordable_loan, 2),
        "max_by_28_rule": max_mortgage_payment,
        "max_by_36_rule": max_payment_after_debts,
        "total_income": total_income,
        "total_expenses": total_expenses,
        "rate": rate,
        "term_years": term_years,
        "message": (
            f"Based on your income and expenses, you can afford a monthly "
            f"mortgage payment of ${affordable_payment:.2f} and a loan "
            f"amount of ${affordable_loan:.2f}."
        ),
    }


def calculate_credit_card_cost(balance, rate):
    """
    Calculate monthly and annual interest cost on a credit card balance.

    Args:
        balance (float): Current credit card balance in dollars
        rate (float): Annual interest rate as a percentage (e.g. 21.47)

    Returns:
        dict: Monthly and annual interest costs or error
    """
    validation = validate_interest_inputs(
        {"balance": balance, "rate": rate}, "credit_card"
    )
    if not validation["valid"]:
        return {"error": validation["error"]}

    annual_cost = round((rate / 100) * balance, 2)
    monthly_cost = round(annual_cost / 12, 2)

    return {
        "monthly_cost": monthly_cost,
        "annual_cost": annual_cost,
        "balance": balance,
        "rate": rate,
        "message": (
            f"A ${balance:.2f} balance at {rate}% APR costs "
            f"${monthly_cost:.2f}/month and ${annual_cost:.2f}/year in interest."
        ),
    }


def calculate_auto_loan_payment(principal, rate, term_months):
    """
    Calculate monthly and annual auto loan payment.

    Args:
        principal (float): Loan amount in dollars
        rate (float): Annual interest rate as a percentage (e.g. 7.89)
        term_months (int): Loan term in months (24/36/48/60/72/84)

    Returns:
        dict: Monthly and annual payment amounts or error
    """
    validation = validate_interest_inputs(
        {"principal": principal, "rate": rate, "term_months": term_months}, "auto_loan"
    )
    if not validation["valid"]:
        return {"error": validation["error"]}

    monthly_rate = (rate / 100) / 12

    if monthly_rate == 0:
        monthly_payment = principal / term_months
    else:
        monthly_payment = (
            principal
            * (monthly_rate * (1 + monthly_rate) ** term_months)
            / ((1 + monthly_rate) ** term_months - 1)
        )

    annual_payment = monthly_payment * 12
    total_cost = monthly_payment * term_months
    total_interest = total_cost - principal

    return {
        "monthly_payment": round(monthly_payment, 2),
        "annual_payment": round(annual_payment, 2),
        "total_cost": round(total_cost, 2),
        "total_interest": round(total_interest, 2),
        "principal": principal,
        "rate": rate,
        "term_months": term_months,
        "message": (
            f"A ${principal:.2f} auto loan at {rate}% for {term_months} "
            f"months costs ${monthly_payment:.2f}/month. Total interest "
            f"paid: ${total_interest:.2f}."
        ),
    }


def calculate_savings_growth(principal, monthly_deposit, rate, months):
    """
    Calculate savings growth over time with compound interest
    and monthly deposits.

    Args:
        principal (float): Initial savings amount in dollars
        monthly_deposit (float): Monthly contribution in dollars
        rate (float): Annual interest rate as a percentage (e.g. 5.25)
        months (int): Number of months to calculate growth

    Returns:
        dict: Final balance, total deposited, and interest earned or error
    """
    validation = validate_interest_inputs(
        {
            "principal": principal,
            "monthly_deposit": monthly_deposit,
            "rate": rate,
            "months": months,
        },
        "savings",
    )
    if not validation["valid"]:
        return {"error": validation["error"]}

    monthly_rate = (rate / 100) / 12
    balance = principal

    for _ in range(int(months)):
        balance += monthly_deposit
        balance += balance * monthly_rate

    total_deposited = principal + (monthly_deposit * months)
    interest_earned = balance - total_deposited
    annual_projection = balance * (1 + monthly_rate) ** 12

    return {
        "final_balance": round(balance, 2),
        "total_deposited": round(total_deposited, 2),
        "interest_earned": round(interest_earned, 2),
        "annual_projection": round(annual_projection, 2),
        "monthly_rate": round(monthly_rate * 100, 4),
        "message": (
            f"After {months} months, your savings will grow to "
            f"${balance:.2f}. You will have deposited ${total_deposited:.2f} "
            f"and earned ${interest_earned:.2f} in interest."
        ),
    }
