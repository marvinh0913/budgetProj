/**
 * Combine the dashboard budget with affordability results into
 * "what would my month look like" scenarios.
 */

// Keep these in sync with the groups in src/python/calculations.py
// Anything not essential or savings (wants, "other", unknown) counts as wants.
const ESSENTIALS = [
  'rent',
  'mortgage',
  'utilities',
  'groceries',
  'transportation',
  'insurance',
  'healthcare',
  'minimum_debt_payments',
];
const SAVINGS = ['savings', 'investments', 'emergency_fund', 'retirement'];

// Housing costs that a home purchase would replace
const HOUSING = ['rent', 'mortgage'];

/** Total the dashboard's budget items by group. */
export const summarizeBudget = (transactions) => {
  const totals = {
    income: 0,
    essentials: 0,
    wants: 0,
    savings: 0,
    housing: 0,
  };

  for (const t of transactions) {
    const amount = Number(t.amount) || 0;

    if (t.type === 'income') {
      totals.income += amount;
      continue;
    }
    if (HOUSING.includes(t.category)) totals.housing += amount;

    if (ESSENTIALS.includes(t.category)) totals.essentials += amount;
    else if (SAVINGS.includes(t.category)) totals.savings += amount;
    else totals.wants += amount; // wants, plus anything uncategorized
  }

  return totals;
};

/** Build the current, with-home, and with-car scenarios. */
export const buildScenarios = (budget, results) => {
  const base = {
    essentials: budget.essentials,
    wants: budget.wants,
    savings: budget.savings,
  };

  const scenarios = [{ label: 'Current budget', ...base, newPayment: 0 }];

  if (results.mortgage.monthly_payment > 0) {
    scenarios.push({
      label: 'With this home',
      ...base,
      essentials: budget.essentials - budget.housing, // the mortgage replaces rent
      newPayment: results.mortgage.monthly_payment,
    });
  }

  if (results.auto.monthly_payment > 0) {
    scenarios.push({
      label: 'With this car',
      ...base,
      newPayment: results.auto.monthly_payment,
    });
  }

  return scenarios.map((s) => {
    const spending = s.essentials + s.wants + s.savings + s.newPayment;
    return { ...s, spending, leftOver: budget.income - spending };
  });
};
