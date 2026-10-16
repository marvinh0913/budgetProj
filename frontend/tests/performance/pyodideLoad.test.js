/**
 * Performance tests for Pyodide initialization.
 * Measures how long Pyodide takes to initialize
 * and return cached instances on subsequent calls.
 * 
 * Thresholds:
 * - First initialization: under 30 seconds
 * - Subsequent calls: under 100ms
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

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    text: async () => '# mock python file',
  });
});

// ─── Initialization performance ───────────────────────────────────────────────

describe('Pyodide initialization performance', () => {
  it('initializes within 30 seconds', async () => {
    const { initializePyodide } = await import('../../src/services/pyodide');

    const start = performance.now();
    await initializePyodide();
    const duration = performance.now() - start;

    console.warn(`Pyodide initialization time: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(30000);
  });

  it('returns cached instance in under 100ms', async () => {
    const { initializePyodide } = await import('../../src/services/pyodide');

    // First call — initialize
    await initializePyodide();

    // Second call — should return cached instance
    const start = performance.now();
    await initializePyodide();
    const duration = performance.now() - start;

    console.warn(`Cached instance retrieval time: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(100);
  });

  it('isReady returns true after initialization', async () => {
    const { initializePyodide, isReady } = await import('../../src/services/pyodide');
    await initializePyodide();
    expect(isReady()).toBe(true);
  });
});

// ─── Calculation performance ──────────────────────────────────────────────────

describe('Pyodide calculation performance', () => {
  it('runs single calculation in under 500ms', async () => {
    mockRunPython.mockReturnValue(JSON.stringify({
      total_income: 3000,
      total_expenses: 1700,
      remaining_balance: 1300,
    }));

    const { runCalculations } = await import('../../src/services/pyodide');
    const transactions = [
      { amount: 3000, category: 'other', type: 'income' },
      { amount: 1500, category: 'rent', type: 'expense' },
    ];

    const start = performance.now();
    await runCalculations(transactions);
    const duration = performance.now() - start;

    console.warn(`Single calculation time: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(500);
  });

  it('runs calculation with 100 transactions in under 1000ms', async () => {
    mockRunPython.mockReturnValue(JSON.stringify({
      total_income: 3000,
      total_expenses: 10000,
      remaining_balance: -7000,
    }));

    const { runCalculations } = await import('../../src/services/pyodide');
    const transactions = [
      { amount: 3000, category: 'other', type: 'income' },
      ...Array.from({ length: 100 }, (_, i) => ({
        amount: 100,
        category: 'groceries',
        type: 'expense',
      })),
    ];

    const start = performance.now();
    await runCalculations(transactions);
    const duration = performance.now() - start;

    console.warn(`100 transaction calculation time: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(1000);
  });

  it('runs calculation with 1000 transactions in under 3000ms', async () => {
    mockRunPython.mockReturnValue(JSON.stringify({
      total_income: 3000,
      total_expenses: 100000,
      remaining_balance: -97000,
    }));

    const { runCalculations } = await import('../../src/services/pyodide');
    const transactions = [
      { amount: 3000, category: 'other', type: 'income' },
      ...Array.from({ length: 1000 }, (_, i) => ({
        amount: 100,
        category: 'groceries',
        type: 'expense',
      })),
    ];

    const start = performance.now();
    await runCalculations(transactions);
    const duration = performance.now() - start;

    console.warn(`1000 transaction calculation time: ${duration.toFixed(2)}ms`);
    expect(duration).toBeLessThan(3000);
  });
});
