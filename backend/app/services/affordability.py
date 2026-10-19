"""
Affordability calculations. Pure functions with no database or HTTP code,
so they're easy to test.

Inputs are monthly dollar amounts and annual rates as percentages
(e.g. 6.5 means 6.5%).
"""

FRONT_END_RATIO = 0.28  # housing payment <= 28% of gross monthly income
BACK_END_RATIO = 0.36  # all debt payments <= 36% of gross monthly income
AUTO_RATIO = 0.10  # car payment <= 10% of gross monthly income (20/4/10 rule)
TAX_INSURANCE_RATE = 0.0125  # est. yearly property tax + insurance, share of home price


def payment_per_dollar(annual_rate: float, months: int) -> float:
    """Monthly payment for each $1 borrowed (standard amortization)."""
    r = annual_rate / 100 / 12
    if r == 0:
        return 1 / months
    return r / (1 - (1 + r) ** -months)


def max_loan(monthly_payment: float, annual_rate: float, months: int) -> float:
    """Largest loan a given monthly payment can repay."""
    if monthly_payment <= 0:
        return 0.0
    return monthly_payment / payment_per_dollar(annual_rate, months)


def mortgage_affordability(
    income: float,
    debts: float,
    down_payment: float,
    annual_rate: float,
    term_years: int = 30,
) -> dict:
    front_end = FRONT_END_RATIO * income
    back_end = BACK_END_RATIO * income - debts
    max_housing = max(min(front_end, back_end), 0.0)

    per_dollar = payment_per_dollar(annual_rate, term_years * 12)
    tax_per_dollar = TAX_INSURANCE_RATE / 12  # monthly tax + insurance per $1 of price

    # Monthly housing = loan * per_dollar + tax_per_dollar * (loan + down_payment)
    # Solve for the loan that makes that equal max_housing:
    loan = (max_housing - tax_per_dollar * down_payment) / (per_dollar + tax_per_dollar)

    if loan > 0:
        price = loan + down_payment
    else:
        # Budget can't support any loan; the down payment alone is the limit,
        # further capped by what taxes and insurance the budget can carry.
        loan = 0.0
        price = min(down_payment, max_housing / tax_per_dollar)

    principal_interest = loan * per_dollar
    taxes_insurance = price * tax_per_dollar

    return {
        "max_home_price": round(price, 2),
        "max_loan": round(loan, 2),
        "monthly_payment": round(principal_interest + taxes_insurance, 2),
        "principal_and_interest": round(principal_interest, 2),
        "taxes_and_insurance": round(taxes_insurance, 2),
        "limited_by": "housing_ratio" if front_end <= back_end else "debt_to_income",
        "rate": annual_rate,
        "term_years": term_years,
    }


def auto_affordability(
    income: float,
    debts: float,
    down_payment: float,
    annual_rate: float,
    term_months: int = 48,
) -> dict:
    by_income = AUTO_RATIO * income
    by_debt = BACK_END_RATIO * income - debts
    payment = max(min(by_income, by_debt), 0.0)

    loan = max_loan(payment, annual_rate, term_months)
    price = loan + down_payment

    return {
        "max_car_price": round(price, 2),
        "max_loan": round(loan, 2),
        "monthly_payment": round(payment, 2),
        "recommended_down_payment": round(0.20 * price, 2),
        "limited_by": "income_ratio" if by_income <= by_debt else "debt_to_income",
        "rate": annual_rate,
        "term_months": term_months,
    }
