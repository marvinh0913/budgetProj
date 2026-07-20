/**
 * Performance tests for budget and interest calculations.
 * Measures calculation speed across different data sizes
 * and calculation types.
 *
 * Thresholds:
 * - Single calculation: under 500ms
 * - Batch calculations: under 3000ms
 * - Interest calculations: under 500ms
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

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

const SAMPLE_BUDGET_SUMMARY = {
  total_income: 3000,
  total_expenses: 1700,
  remaining_balance: 1300,
  spending_by_category: { rent: 1500, groceries: 200 },
  category_percentages: { rent: 50.0, groceries: 6.67 },
  group_totals: { essentials: 1700, wants: 0, savings: 0, other: 0 },
  suggestions: [],
};

const SAMPLE_MORTGAGE_RESULT = {
  monthly_payment: 1914.0,
  annual_payment: 22967.94,
  loan_amount: 300000,
  rate: 6.59,
  term_years: 30,
  total_payments: 360,
};

const SAMPLE_CREDIT_CARD_RESULT = {
  monthly_cost: 89.46,
  annual_cost: 1073.5,
  balance: 5000,
  rate: 21.47,
};

const SAMPLE_AUTO_LOAN_RESULT = {
  monthly_payment: 505.59,
  annual_payment: 6067.08,
  total_cost: 30335.69,
  total_interest: 5335.69,
  principal: 25000,
  rate: 7.89,
  term_months: 60,
};

const SAMPLE_SAVINGS_RESULT = {
  final_balance: 3652.32,
  total_deposited: 3400,
  interest_earned: 252.32,
  annual_projection: 3845.21,
};

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    text: async () => '# mock python file',
  });
  mockRunPython.mockReturnValue(JSON.stringify(SAMPLE_BUDGET_SUMMARY));
});

// ─── Budget calculation speed ─────────────────────────────────────────────────

describe('budget calculation speed', () => {
  it('single transaction calculation completes under 500ms', async () => {
    const { runCalculations } = await import('../../src/services/pyodide');
    const transactions = [
      { amount: 3000, category: 'other', type: 'income' },
      { amount: 1500, category: 'rent', type: 'expense' },
    ];

    const start = performance.now();
    await runCalculations(transactions);
    const duration = performance.now() - start;

    console.warn(`Single calculation: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(500);
  });

  it('10 transactions complete under 500ms', async () => {
    const { runCalculations } = await import('../../src/services/pyodide');
    const transactions = [
      { amount: 3000, category: 'other', type: 'income' },
      ...Array.from({ length: 10 }, () => ({
        amount: 100,
        category: 'groceries',
        type: 'expense',
      })),
    ];

    const start = performance.now();
    await runCalculations(transactions);
    const duration = performance.now() - start;

    console.warn(`10 transactions: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(500);
  });

  it('100 transactions complete under 1000ms', async () => {
    const { runCalculations } = await import('../../src/services/pyodide');
    const transactions = [
      { amount: 3000, category: 'other', type: 'income' },
      ...Array.from({ length: 100 }, () => ({
        amount: 100,
        category: 'groceries',
        type: 'expense',
      })),
    ];

    const start = performance.now();
    await runCalculations(transactions);
    const duration = performance.now() - start;

    console.warn(`100 transactions: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(1000);
  });

  it('1000 transactions complete under 3000ms', async () => {
    const { runCalculations } = await import('../../src/services/pyodide');
    const transactions = [
      { amount: 3000, category: 'other', type: 'income' },
      ...Array.from({ length: 1000 }, () => ({
        amount: 100,
        category: 'groceries',
        type: 'expense',
      })),
    ];

    const start = performance.now();
    await runCalculations(transactions);
    const duration = performance.now() - start;

    console.warn(`1000 transactions: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(3000);
  });

  it('multiple sequential calculations complete under 2000ms', async () => {
    const { runCalculations } = await import('../../src/services/pyodide');
    const transactions = [
      { amount: 3000, category: 'other', type: 'income' },
      { amount: 1500, category: 'rent', type: 'expense' },
    ];

    const start = performance.now();
    await runCalculations(transactions);
    await runCalculations(transactions);
    await runCalculations(transactions);
    await runCalculations(transactions);
    await runCalculations(transactions);
    const duration = performance.now() - start;

    console.warn(`5 sequential calculations: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(2000);
  });
});

// ─── Interest calculation speed ───────────────────────────────────────────────

describe('interest calculation speed', () => {
  it('mortgage calculation completes under 500ms', async () => {
    mockRunPython.mockReturnValue(JSON.stringify(SAMPLE_MORTGAGE_RESULT));
    const { runInterestCalculation } = await import('../../src/services/pyodide');

    const start = performance.now();
    await runInterestCalculation('mortgage', {
      loan_amount: 300000,
      rate: 6.59,
      term_years: 30,
    });
    const duration = performance.now() - start;

    console.warn(`Mortgage calculation: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(500);
  });

  it('credit card calculation completes under 500ms', async () => {
    mockRunPython.mockReturnValue(JSON.stringify(SAMPLE_CREDIT_CARD_RESULT));
    const { runInterestCalculation } = await import('../../src/services/pyodide');

    const start = performance.now();
    await runInterestCalculation('credit_card', {
      balance: 5000,
      rate: 21.47,
    });
    const duration = performance.now() - start;

    console.warn(`Credit card calculation: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(500);
  });

  it('auto loan calculation completes under 500ms', async () => {
    mockRunPython.mockReturnValue(JSON.stringify(SAMPLE_AUTO_LOAN_RESULT));
    const { runInterestCalculation } = await import('../../src/services/pyodide');

    const start = performance.now();
    await runInterestCalculation('auto_loan', {
      principal: 25000,
      rate: 7.89,
      term_months: 60,
    });
    const duration = performance.now() - start;

    console.warn(`Auto loan calculation: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(500);
  });

  it('savings calculation completes under 500ms', async () => {
    mockRunPython.mockReturnValue(JSON.stringify(SAMPLE_SAVINGS_RESULT));
    const { runInterestCalculation } = await import('../../src/services/pyodide');

    const start = performance.now();
    await runInterestCalculation('savings', {
      principal: 1000,
      monthly_deposit: 200,
      rate: 5.25,
      months: 12,
    });
    const duration = performance.now() - start;

    console.warn(`Savings calculation: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(500);
  });

  it('all four interest calculations complete under 2000ms', async () => {
    const { runInterestCalculation } = await import('../../src/services/pyodide');

    const start = performance.now();

    mockRunPython.mockReturnValue(JSON.stringify(SAMPLE_MORTGAGE_RESULT));
    await runInterestCalculation('mortgage', {
      loan_amount: 300000,
      rate: 6.59,
      term_years: 30,
    });

    mockRunPython.mockReturnValue(JSON.stringify(SAMPLE_CREDIT_CARD_RESULT));
    await runInterestCalculation('credit_card', {
      balance: 5000,
      rate: 21.47,
    });

    mockRunPython.mockReturnValue(JSON.stringify(SAMPLE_AUTO_LOAN_RESULT));
    await runInterestCalculation('auto_loan', {
      principal: 25000,
      rate: 7.89,
      term_months: 60,
    });

    mockRunPython.mockReturnValue(JSON.stringify(SAMPLE_SAVINGS_RESULT));
    await runInterestCalculation('savings', {
      principal: 1000,
      monthly_deposit: 200,
      rate: 5.25,
      months: 12,
    });

    const duration = performance.now() - start;
    console.warn(`All four interest calculations: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(2000);
  });
});
