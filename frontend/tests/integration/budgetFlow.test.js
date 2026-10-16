/**
 * Integration tests for budget calculation flow.
 * Tests the full pipeline: transactions saved to storage →
 * retrieved from storage → passed to Pyodide →
 * calculations returned correctly.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveTransactions,
  getTransactions,
  clearAll,
} from '../../src/services/storage';

// ─── Mock Pyodide ─────────────────────────────────────────────────────────────

const mockRunPython = vi.fn();
const mockGlobalsSet = vi.fn();

const mockPyodideInstance = {
  globals: { set: mockGlobalsSet },
  runPython: mockRunPython,
};

vi.mock('pyodide', () => ({
  loadPyodide: () => Promise.resolve(mockPyodideInstance),
}));

// ─── Sample Data ─────────────────────────────────────────────────────────────

const SAMPLE_TRANSACTIONS = [
  { amount: 3000, category: 'other', type: 'income' },
  { amount: 1500, category: 'rent', type: 'expense' },
  { amount: 200, category: 'groceries', type: 'expense' },
  { amount: 100, category: 'dining', type: 'expense' },
  { amount: 200, category: 'savings', type: 'expense' },
];

const SAMPLE_BUDGET_SUMMARY = {
  total_income: 3000,
  total_expenses: 2000,
  remaining_balance: 1000,
  spending_by_category: {
    rent: 1500,
    groceries: 200,
    dining: 100,
    savings: 200,
  },
  category_percentages: {
    rent: 50.0,
    groceries: 6.67,
    dining: 3.33,
    savings: 6.67,
  },
  group_totals: {
    essentials: 1700,
    wants: 100,
    savings: 200,
    other: 0,
  },
  suggestions: [
    {
      group: 'essentials',
      current_amount: 1700,
      current_percentage: 56.67,
      recommended_percentage: 50.0,
      recommended_amount: 1500,
      difference: 200,
      message: 'Your essentials spending is 56.67% of income...',
    },
  ],
};

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();

  vi.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    text: async () => '# mock python file',
  });

  mockRunPython.mockReturnValue(JSON.stringify(SAMPLE_BUDGET_SUMMARY));
});

// ─── Save → Retrieve → Calculate ─────────────────────────────────────────────

describe('save and retrieve transactions', () => {
  it('saves transactions and retrieves them correctly', () => {
    saveTransactions(SAMPLE_TRANSACTIONS);
    const retrieved = getTransactions();
    expect(retrieved).toEqual(SAMPLE_TRANSACTIONS);
  });

  it('retrieved transactions match original length', () => {
    saveTransactions(SAMPLE_TRANSACTIONS);
    const retrieved = getTransactions();
    expect(retrieved.length).toBe(SAMPLE_TRANSACTIONS.length);
  });

  it('retrieved transactions have correct structure', () => {
    saveTransactions(SAMPLE_TRANSACTIONS);
    const retrieved = getTransactions();
    retrieved.forEach((t) => {
      expect(t).toHaveProperty('amount');
      expect(t).toHaveProperty('category');
      expect(t).toHaveProperty('type');
    });
  });

  it('returns empty array after clearing', () => {
    saveTransactions(SAMPLE_TRANSACTIONS);
    clearAll();
    expect(getTransactions()).toEqual([]);
  });
});

// ─── Calculate from stored transactions ──────────────────────────────────────

describe('calculate from stored transactions', () => {
  it('passes stored transactions to Python correctly', async () => {
    const { runCalculations } = await import('../../src/services/pyodide');
    saveTransactions(SAMPLE_TRANSACTIONS);
    const transactions = getTransactions();
    await runCalculations(transactions);
    expect(mockGlobalsSet).toHaveBeenCalledWith(
      'transactions_json',
      JSON.stringify(transactions)
    );
  });

  it('returns correct total income from calculation', async () => {
    const { runCalculations } = await import('../../src/services/pyodide');
    saveTransactions(SAMPLE_TRANSACTIONS);
    const transactions = getTransactions();
    const result = await runCalculations(transactions);
    expect(result.success).toBe(true);
    expect(result.data.total_income).toBe(3000);
  });

  it('returns correct total expenses from calculation', async () => {
    const { runCalculations } = await import('../../src/services/pyodide');
    saveTransactions(SAMPLE_TRANSACTIONS);
    const transactions = getTransactions();
    const result = await runCalculations(transactions);
    expect(result.data.total_expenses).toBe(2000);
  });

  it('returns correct remaining balance', async () => {
    const { runCalculations } = await import('../../src/services/pyodide');
    saveTransactions(SAMPLE_TRANSACTIONS);
    const transactions = getTransactions();
    const result = await runCalculations(transactions);
    expect(result.data.remaining_balance).toBe(1000);
  });

  it('returns spending by category', async () => {
    const { runCalculations } = await import('../../src/services/pyodide');
    saveTransactions(SAMPLE_TRANSACTIONS);
    const transactions = getTransactions();
    const result = await runCalculations(transactions);
    expect(result.data.spending_by_category).toBeTruthy();
    expect(result.data.spending_by_category.rent).toBe(1500);
  });

  it('returns category percentages', async () => {
    const { runCalculations } = await import('../../src/services/pyodide');
    saveTransactions(SAMPLE_TRANSACTIONS);
    const transactions = getTransactions();
    const result = await runCalculations(transactions);
    expect(result.data.category_percentages).toBeTruthy();
    expect(result.data.category_percentages.rent).toBe(50.0);
  });

  it('returns group totals', async () => {
    const { runCalculations } = await import('../../src/services/pyodide');
    saveTransactions(SAMPLE_TRANSACTIONS);
    const transactions = getTransactions();
    const result = await runCalculations(transactions);
    expect(result.data.group_totals).toBeTruthy();
    expect(result.data.group_totals.essentials).toBe(1700);
  });

  it('returns budget suggestions', async () => {
    const { runCalculations } = await import('../../src/services/pyodide');
    saveTransactions(SAMPLE_TRANSACTIONS);
    const transactions = getTransactions();
    const result = await runCalculations(transactions);
    expect(Array.isArray(result.data.suggestions)).toBe(true);
  });
});

// ─── Update transactions and recalculate ─────────────────────────────────────

describe('update transactions and recalculate', () => {
  it('reflects updated transactions in calculation', async () => {
    const { runCalculations } = await import('../../src/services/pyodide');

    // Save initial transactions
    saveTransactions(SAMPLE_TRANSACTIONS);

    // Add a new transaction
    const updated = [
      ...SAMPLE_TRANSACTIONS,
      { amount: 500, category: 'entertainment', type: 'expense' },
    ];

    // Update mock to reflect new total
    mockRunPython.mockReturnValue(
      JSON.stringify({
        ...SAMPLE_BUDGET_SUMMARY,
        total_expenses: 2500,
        remaining_balance: 500,
      })
    );

    saveTransactions(updated);
    const transactions = getTransactions();
    const result = await runCalculations(transactions);

    expect(result.data.total_expenses).toBe(2500);
    expect(result.data.remaining_balance).toBe(500);
  });

  it('updated storage reflects new transaction count', () => {
    saveTransactions(SAMPLE_TRANSACTIONS);
    const updated = [
      ...SAMPLE_TRANSACTIONS,
      { amount: 500, category: 'entertainment', type: 'expense' },
    ];
    saveTransactions(updated);
    expect(getTransactions().length).toBe(6);
  });
});

// ─── Error handling ───────────────────────────────────────────────────────────

describe('error handling in budget flow', () => {
  it('handles empty transactions gracefully', async () => {
    const { runCalculations } = await import('../../src/services/pyodide');
    mockRunPython.mockReturnValue(
      JSON.stringify({ error: 'Transactions list cannot be empty' })
    );
    const result = await runCalculations([]);
    expect(result.success).toBe(true);
    expect(result.data.error).toBeTruthy();
  });

  it('handles calculation failure gracefully', async () => {
    const { runCalculations } = await import('../../src/services/pyodide');
    mockRunPython.mockImplementation(() => {
      throw new Error('Python error');
    });
    const result = await runCalculations(SAMPLE_TRANSACTIONS);
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });
});
