/**
 * Unit tests for pyodide.js
 * Mocks the Pyodide runtime to test initialization logic,
 * calculation bridging, and error handling without loading
 * the full Pyodide runtime.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ─── Mock pyodide at top level ────────────────────────────────────────────────

const mockRunPython = vi.fn();
const mockGlobalsSet = vi.fn();

const mockPyodideInstance = {
  globals: { set: mockGlobalsSet },
  runPython: mockRunPython,
};

const mockLoadPyodide = vi.fn().mockResolvedValue(mockPyodideInstance);

vi.mock('pyodide', () => ({
  loadPyodide: () => mockLoadPyodide(),
}));

// ─── Sample Data ─────────────────────────────────────────────────────────────

const SAMPLE_TRANSACTIONS = [
  { amount: 3000, category: 'other', type: 'income' },
  { amount: 1500, category: 'rent', type: 'expense' },
  { amount: 200, category: 'groceries', type: 'expense' },
];

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

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();

  // Default fetch mock for Python files
  vi.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    text: async () => '# mock python file',
  });

  // Default runPython mock
  mockRunPython.mockReturnValue(JSON.stringify(SAMPLE_BUDGET_SUMMARY));
});

// ─── isReady ─────────────────────────────────────────────────────────────────

describe('isReady', () => {
  it('returns a boolean', async () => {
    const { isReady } = await import('../../src/services/pyodide');
    expect(typeof isReady()).toBe('boolean');
  });
});

// ─── initializePyodide ────────────────────────────────────────────────────────

describe('initializePyodide'), () => {
  it('loads Pyodide successfully'), async () => {
    const { initializePyodide } = await import('../../src/services/pyodide');
    const result = await initializePyodide();
    expect(result).toBeTruthy();
}};

  it('returns same instance on second call', async () => {
    const { initializePyodide } = await import('../../src/services/pyodide');
    const first = await initializePyodide();
    const second = await initializePyodide();
    expect(first).toBe(second);
  });

  it('returns existing instance on subsequent calls', async () => {
    const { initializePyodide } = await import('../../src/services/pyodide');
    const first = await initializePyodide();
    const second = await initializePyodide();
    expect(first).toBe(second);
  });

  it('returns a valid pyodide instance', async () => {
    const { initializePyodide } = await import('../../src/services/pyodide');
    const result = await initializePyodide();
    expect(result).toBeTruthy();
    expect(result.runPython).toBeDefined();
  });

// ─── runCalculations ──────────────────────────────────────────────────────────

describe('runCalculations', () => {
  it('returns success with budget summary', async () => {
    mockRunPython.mockReturnValue(JSON.stringify(SAMPLE_BUDGET_SUMMARY));
    const { runCalculations } = await import('../../src/services/pyodide');
    const result = await runCalculations(SAMPLE_TRANSACTIONS);
    expect(result.success).toBe(true);
    expect(result.data).toBeTruthy();
  });

  it('passes transactions as JSON to Python globals', async () => {
    mockRunPython.mockReturnValue(JSON.stringify(SAMPLE_BUDGET_SUMMARY));
    const { runCalculations } = await import('../../src/services/pyodide');
    await runCalculations(SAMPLE_TRANSACTIONS);
    expect(mockGlobalsSet).toHaveBeenCalledWith(
      'transactions_json',
      JSON.stringify(SAMPLE_TRANSACTIONS)
    );
  });

  it('returns error on calculation failure', async () => {
    mockRunPython.mockImplementation(() => {
      throw new Error('Python error');
    });
    const { runCalculations } = await import('../../src/services/pyodide');
    const result = await runCalculations(SAMPLE_TRANSACTIONS);
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('returns parsed data object', async () => {
    mockRunPython.mockReturnValue(JSON.stringify(SAMPLE_BUDGET_SUMMARY));
    const { runCalculations } = await import('../../src/services/pyodide');
    const result = await runCalculations(SAMPLE_TRANSACTIONS);
    expect(result.data).toEqual(SAMPLE_BUDGET_SUMMARY);
  });
});

// ─── runInterestCalculation ───────────────────────────────────────────────────

describe('runInterestCalculation', () => {
  it('returns success for mortgage calculation', async () => {
    mockRunPython.mockReturnValue(JSON.stringify(SAMPLE_MORTGAGE_RESULT));
    const { runInterestCalculation } = await import('../../src/services/pyodide');
    const result = await runInterestCalculation('mortgage', {
      loan_amount: 300000,
      rate: 6.59,
      term_years: 30,
    });
    expect(result.success).toBe(true);
    expect(result.data).toBeTruthy();
  });

  it('sets calc_type in Python globals', async () => {
    mockRunPython.mockReturnValue(JSON.stringify(SAMPLE_MORTGAGE_RESULT));
    const { runInterestCalculation } = await import('../../src/services/pyodide');
    await runInterestCalculation('mortgage', {
      loan_amount: 300000,
      rate: 6.59,
      term_years: 30,
    });
    expect(mockGlobalsSet).toHaveBeenCalledWith('calc_type', 'mortgage');
  });

  it('sets calc_data_json in Python globals', async () => {
    mockRunPython.mockReturnValue(JSON.stringify(SAMPLE_MORTGAGE_RESULT));
    const { runInterestCalculation } = await import('../../src/services/pyodide');
    const data = { loan_amount: 300000, rate: 6.59, term_years: 30 };
    await runInterestCalculation('mortgage', data);
    expect(mockGlobalsSet).toHaveBeenCalledWith(
      'calc_data_json',
      JSON.stringify(data)
    );
  });

  it('returns error on calculation failure', async () => {
    mockRunPython.mockImplementation(() => {
      throw new Error('Python error');
    });
    const { runInterestCalculation } = await import('../../src/services/pyodide');
    const result = await runInterestCalculation('mortgage', {
      loan_amount: 300000,
      rate: 6.59,
      term_years: 30,
    });
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('returns parsed data object', async () => {
    mockRunPython.mockReturnValue(JSON.stringify(SAMPLE_MORTGAGE_RESULT));
    const { runInterestCalculation } = await import('../../src/services/pyodide');
    const result = await runInterestCalculation('mortgage', {
      loan_amount: 300000,
      rate: 6.59,
      term_years: 30,
    });
    expect(result.data).toEqual(SAMPLE_MORTGAGE_RESULT);
  });
});
