/**
 * Unit tests for storage.js
 * Tests localStorage reads, writes, and error handling
 * for transactions, budgets, and rates.
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

// ─── saveTransactions / getTransactions ──────────────────────────────────────

describe('saveTransactions', () => {
  it('saves transactions to localStorage', () => {
    const result = saveTransactions(SAMPLE_TRANSACTIONS);
    expect(result.success).toBe(true);
  });

  it('saves and retrieves transactions correctly', () => {
    saveTransactions(SAMPLE_TRANSACTIONS);
    const retrieved = getTransactions();
    expect(retrieved).toEqual(SAMPLE_TRANSACTIONS);
  });

  it('overwrites existing transactions on save', () => {
    saveTransactions(SAMPLE_TRANSACTIONS);
    const newTransactions = [
      { amount: 5000, category: 'other', type: 'income' },
    ];
    saveTransactions(newTransactions);
    const retrieved = getTransactions();
    expect(retrieved).toEqual(newTransactions);
  });
});

describe('getTransactions', () => {
  it('returns empty array if no transactions saved', () => {
    const result = getTransactions();
    expect(result).toEqual([]);
  });

  it('returns correct number of transactions', () => {
    saveTransactions(SAMPLE_TRANSACTIONS);
    const result = getTransactions();
    expect(result.length).toBe(3);
  });

  it('returns transactions with correct structure', () => {
    saveTransactions(SAMPLE_TRANSACTIONS);
    const result = getTransactions();
    expect(result[0]).toHaveProperty('amount');
    expect(result[0]).toHaveProperty('category');
    expect(result[0]).toHaveProperty('type');
  });
});

describe('clearTransactions', () => {
  it('removes transactions from localStorage', () => {
    saveTransactions(SAMPLE_TRANSACTIONS);
    clearTransactions();
    const result = getTransactions();
    expect(result).toEqual([]);
  });

  it('does not affect budgets when clearing transactions', () => {
    saveTransactions(SAMPLE_TRANSACTIONS);
    saveBudgets(SAMPLE_BUDGETS);
    clearTransactions();
    const budgets = getBudgets();
    expect(budgets).toEqual(SAMPLE_BUDGETS);
  });
});

// ─── saveBudgets / getBudgets ─────────────────────────────────────────────────

describe('saveBudgets', () => {
  it('saves budgets to localStorage', () => {
    const result = saveBudgets(SAMPLE_BUDGETS);
    expect(result.success).toBe(true);
  });

  it('saves and retrieves budgets correctly', () => {
    saveBudgets(SAMPLE_BUDGETS);
    const retrieved = getBudgets();
    expect(retrieved).toEqual(SAMPLE_BUDGETS);
  });

  it('overwrites existing budgets on save', () => {
    saveBudgets(SAMPLE_BUDGETS);
    const newBudgets = { essentials: 2000 };
    saveBudgets(newBudgets);
    const retrieved = getBudgets();
    expect(retrieved).toEqual(newBudgets);
  });
});

describe('getBudgets', () => {
  it('returns empty object if no budgets saved', () => {
    const result = getBudgets();
    expect(result).toEqual({});
  });

  it('returns correct budget values', () => {
    saveBudgets(SAMPLE_BUDGETS);
    const result = getBudgets();
    expect(result.essentials).toBe(1500);
    expect(result.wants).toBe(900);
    expect(result.savings).toBe(600);
  });
});

describe('clearBudgets', () => {
  it('removes budgets from localStorage', () => {
    saveBudgets(SAMPLE_BUDGETS);
    clearBudgets();
    const result = getBudgets();
    expect(result).toEqual({});
  });

  it('does not affect transactions when clearing budgets', () => {
    saveTransactions(SAMPLE_TRANSACTIONS);
    saveBudgets(SAMPLE_BUDGETS);
    clearBudgets();
    const transactions = getTransactions();
    expect(transactions).toEqual(SAMPLE_TRANSACTIONS);
  });
});

// ─── saveRates / getRates ─────────────────────────────────────────────────────

describe('saveRates', () => {
  it('saves rates to localStorage', () => {
    const result = saveRates(SAMPLE_RATES, SAMPLE_TIMESTAMPS);
    expect(result.success).toBe(true);
  });

  it('saves and retrieves rates correctly', () => {
    saveRates(SAMPLE_RATES, SAMPLE_TIMESTAMPS);
    const retrieved = getRates();
    expect(retrieved.rates).toEqual(SAMPLE_RATES);
  });

  it('saves and retrieves timestamps correctly', () => {
    saveRates(SAMPLE_RATES, SAMPLE_TIMESTAMPS);
    const retrieved = getRates();
    expect(retrieved.timestamps).toEqual(SAMPLE_TIMESTAMPS);
  });
});

describe('getRates', () => {
  it('returns null if no rates saved', () => {
    const result = getRates();
    expect(result).toBeNull();
  });

  it('returns correct rate values', () => {
    saveRates(SAMPLE_RATES, SAMPLE_TIMESTAMPS);
    const result = getRates();
    expect(result.rates.mortgage).toBe(6.59);
    expect(result.rates.federal_funds).toBe(5.25);
    expect(result.rates.credit_card).toBe(21.47);
    expect(result.rates.auto_loan).toBe(7.89);
  });
});

describe('clearRates', () => {
  it('removes rates from localStorage', () => {
    saveRates(SAMPLE_RATES, SAMPLE_TIMESTAMPS);
    clearRates();
    const result = getRates();
    expect(result).toBeNull();
  });

  it('does not affect transactions when clearing rates', () => {
    saveTransactions(SAMPLE_TRANSACTIONS);
    saveRates(SAMPLE_RATES, SAMPLE_TIMESTAMPS);
    clearRates();
    const transactions = getTransactions();
    expect(transactions).toEqual(SAMPLE_TRANSACTIONS);
  });
});

// ─── clearAll ─────────────────────────────────────────────────────────────────

describe('clearAll', () => {
  it('removes all data from localStorage', () => {
    saveTransactions(SAMPLE_TRANSACTIONS);
    saveBudgets(SAMPLE_BUDGETS);
    saveRates(SAMPLE_RATES, SAMPLE_TIMESTAMPS);
    clearAll();
    expect(getTransactions()).toEqual([]);
    expect(getBudgets()).toEqual({});
    expect(getRates()).toBeNull();
  });

  it('does not throw if localStorage is already empty', () => {
    expect(() => clearAll()).not.toThrow();
  });
});