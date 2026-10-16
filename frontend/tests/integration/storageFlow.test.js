/**
 * Integration tests for storage flow.
 * Tests multi-step real world scenarios involving
 * transactions, budgets, and rates stored together.
 * Focuses on how storage functions interact with each other
 * rather than testing each function in isolation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveTransactions,
  getTransactions,
  clearTransactions,
  saveBudgets,
  getBudgets,
  clearBudgets,
  saveRates,
  getRates,
  clearRates,
  clearAll,
} from '../../src/services/storage';

// ─── Sample Data ─────────────────────────────────────────────────────────────

const SAMPLE_TRANSACTIONS = [
  { amount: 3000, category: 'other', type: 'income' },
  { amount: 1500, category: 'rent', type: 'expense' },
  { amount: 200, category: 'groceries', type: 'expense' },
];

const UPDATED_TRANSACTIONS = [
  { amount: 4000, category: 'other', type: 'income' },
  { amount: 1500, category: 'rent', type: 'expense' },
  { amount: 200, category: 'groceries', type: 'expense' },
  { amount: 100, category: 'dining', type: 'expense' },
];

const SAMPLE_BUDGETS = {
  essentials: 1500,
  wants: 900,
  savings: 600,
};

const SAMPLE_RATES = {
  mortgage: 6.59,
  federal_funds: 5.25,
  credit_card: 21.47,
  auto_loan: 7.89,
};

const SAMPLE_TIMESTAMPS = {
  mortgage: Date.now(),
  federal_funds: Date.now(),
  credit_card: Date.now(),
  auto_loan: Date.now(),
};

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear();
});

// ─── Save all data types together ────────────────────────────────────────────

describe('saving all data types simultaneously', () => {
  it('saves all three data types without interference', () => {
    saveTransactions(SAMPLE_TRANSACTIONS);
    saveBudgets(SAMPLE_BUDGETS);
    saveRates(SAMPLE_RATES, SAMPLE_TIMESTAMPS);

    expect(getTransactions()).toEqual(SAMPLE_TRANSACTIONS);
    expect(getBudgets()).toEqual(SAMPLE_BUDGETS);
    expect(getRates().rates).toEqual(SAMPLE_RATES);
  });

  it('each data type stored independently in localStorage', () => {
    saveTransactions(SAMPLE_TRANSACTIONS);
    saveBudgets(SAMPLE_BUDGETS);
    saveRates(SAMPLE_RATES, SAMPLE_TIMESTAMPS);

    expect(localStorage.length).toBe(3);
  });

  it('all data types retrievable after saving together', () => {
    saveTransactions(SAMPLE_TRANSACTIONS);
    saveBudgets(SAMPLE_BUDGETS);
    saveRates(SAMPLE_RATES, SAMPLE_TIMESTAMPS);

    const transactions = getTransactions();
    const budgets = getBudgets();
    const rates = getRates();

    expect(transactions.length).toBe(3);
    expect(budgets.essentials).toBe(1500);
    expect(rates.rates.mortgage).toBe(6.59);
  });
});

// ─── Selective clearing ───────────────────────────────────────────────────────

describe('selective clearing does not affect other data', () => {
  it('clearing transactions does not affect budgets or rates', () => {
    saveTransactions(SAMPLE_TRANSACTIONS);
    saveBudgets(SAMPLE_BUDGETS);
    saveRates(SAMPLE_RATES, SAMPLE_TIMESTAMPS);

    clearTransactions();

    expect(getTransactions()).toEqual([]);
    expect(getBudgets()).toEqual(SAMPLE_BUDGETS);
    expect(getRates().rates).toEqual(SAMPLE_RATES);
  });

  it('clearing budgets does not affect transactions or rates', () => {
    saveTransactions(SAMPLE_TRANSACTIONS);
    saveBudgets(SAMPLE_BUDGETS);
    saveRates(SAMPLE_RATES, SAMPLE_TIMESTAMPS);

    clearBudgets();

    expect(getTransactions()).toEqual(SAMPLE_TRANSACTIONS);
    expect(getBudgets()).toEqual({});
    expect(getRates().rates).toEqual(SAMPLE_RATES);
  });

  it('clearing rates does not affect transactions or budgets', () => {
    saveTransactions(SAMPLE_TRANSACTIONS);
    saveBudgets(SAMPLE_BUDGETS);
    saveRates(SAMPLE_RATES, SAMPLE_TIMESTAMPS);

    clearRates();

    expect(getTransactions()).toEqual(SAMPLE_TRANSACTIONS);
    expect(getBudgets()).toEqual(SAMPLE_BUDGETS);
    expect(getRates()).toBeNull();
  });

  it('clearAll removes all three data types', () => {
    saveTransactions(SAMPLE_TRANSACTIONS);
    saveBudgets(SAMPLE_BUDGETS);
    saveRates(SAMPLE_RATES, SAMPLE_TIMESTAMPS);

    clearAll();

    expect(getTransactions()).toEqual([]);
    expect(getBudgets()).toEqual({});
    expect(getRates()).toBeNull();
  });
});

// ─── Simulating page reload ───────────────────────────────────────────────────

describe('simulating page reload', () => {
  it('transactions persist after simulated reload', () => {
    // Save data
    saveTransactions(SAMPLE_TRANSACTIONS);

    // Simulate reload by reading fresh from localStorage
    const afterReload = getTransactions();
    expect(afterReload).toEqual(SAMPLE_TRANSACTIONS);
  });

  it('budgets persist after simulated reload', () => {
    saveBudgets(SAMPLE_BUDGETS);
    const afterReload = getBudgets();
    expect(afterReload).toEqual(SAMPLE_BUDGETS);
  });

  it('rates persist after simulated reload', () => {
    saveRates(SAMPLE_RATES, SAMPLE_TIMESTAMPS);
    const afterReload = getRates();
    expect(afterReload.rates).toEqual(SAMPLE_RATES);
  });

  it('all data persists after simulated reload', () => {
    saveTransactions(SAMPLE_TRANSACTIONS);
    saveBudgets(SAMPLE_BUDGETS);
    saveRates(SAMPLE_RATES, SAMPLE_TIMESTAMPS);

    const transactions = getTransactions();
    const budgets = getBudgets();
    const rates = getRates();

    expect(transactions).toEqual(SAMPLE_TRANSACTIONS);
    expect(budgets).toEqual(SAMPLE_BUDGETS);
    expect(rates.rates).toEqual(SAMPLE_RATES);
  });
});

// ─── Update sequences ─────────────────────────────────────────────────────────

describe('update sequences', () => {
  it('updating transactions does not affect budgets', () => {
    saveTransactions(SAMPLE_TRANSACTIONS);
    saveBudgets(SAMPLE_BUDGETS);

    saveTransactions(UPDATED_TRANSACTIONS);

    expect(getTransactions()).toEqual(UPDATED_TRANSACTIONS);
    expect(getBudgets()).toEqual(SAMPLE_BUDGETS);
  });

  it('updating rates does not affect transactions', () => {
    saveTransactions(SAMPLE_TRANSACTIONS);
    saveRates(SAMPLE_RATES, SAMPLE_TIMESTAMPS);

    const updatedRates = { ...SAMPLE_RATES, mortgage: 7.0 };
    saveRates(updatedRates, SAMPLE_TIMESTAMPS);

    expect(getTransactions()).toEqual(SAMPLE_TRANSACTIONS);
    expect(getRates().rates.mortgage).toBe(7.0);
  });

  it('multiple transaction updates reflect latest data', () => {
    saveTransactions(SAMPLE_TRANSACTIONS);
    expect(getTransactions().length).toBe(3);

    saveTransactions(UPDATED_TRANSACTIONS);
    expect(getTransactions().length).toBe(4);

    saveTransactions([]);
    expect(getTransactions()).toEqual([]);
  });

  it('save → clear → save restores correct data', () => {
    saveTransactions(SAMPLE_TRANSACTIONS);
    clearTransactions();
    saveTransactions(UPDATED_TRANSACTIONS);
    expect(getTransactions()).toEqual(UPDATED_TRANSACTIONS);
  });
});

// ─── Multi step real world scenarios ─────────────────────────────────────────

describe('multi step real world scenarios', () => {
  it('user adds transactions, views budget, then clears data', () => {
    // Step 1 — user adds transactions
    saveTransactions(SAMPLE_TRANSACTIONS);
    expect(getTransactions().length).toBe(3);

    // Step 2 — rates are cached
    saveRates(SAMPLE_RATES, SAMPLE_TIMESTAMPS);
    expect(getRates().rates).toBeTruthy();

    // Step 3 — user clears their data
    clearAll();
    expect(getTransactions()).toEqual([]);
    expect(getRates()).toBeNull();
  });

  it('user updates transactions multiple times before viewing results', () => {
    // Step 1 — initial entry
    saveTransactions(SAMPLE_TRANSACTIONS);
    expect(getTransactions().length).toBe(3);

    // Step 2 — user adds more
    const withMore = [
      ...SAMPLE_TRANSACTIONS,
      { amount: 100, category: 'dining', type: 'expense' },
    ];
    saveTransactions(withMore);
    expect(getTransactions().length).toBe(4);

    // Step 3 — user removes one and saves again
    saveTransactions(UPDATED_TRANSACTIONS);
    expect(getTransactions().length).toBe(4);
    expect(getTransactions()[0].amount).toBe(4000);
  });

  it('rates cached then transactions updated independently', () => {
    // Step 1 — cache rates on app load
    saveRates(SAMPLE_RATES, SAMPLE_TIMESTAMPS);

    // Step 2 — user enters transactions
    saveTransactions(SAMPLE_TRANSACTIONS);

    // Step 3 — user updates transactions
    saveTransactions(UPDATED_TRANSACTIONS);

    // Rates should still be cached and unchanged
    expect(getRates().rates).toEqual(SAMPLE_RATES);
    expect(getTransactions()).toEqual(UPDATED_TRANSACTIONS);
  });
});
