/**
 * Tests for Dashboard page component.
 * Covers rendering of all child components,
 * transaction management, and calculate flow.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../../src/pages/Dashboard';

// ─── Mock services ────────────────────────────────────────────────────────────

vi.mock('../../src/services/pyodide', () => ({
  initializePyodide: vi.fn().mockResolvedValue({}),
  runCalculations: vi.fn().mockResolvedValue({
    success: true,
    data: {
      total_income: 3000,
      total_expenses: 1700,
      remaining_balance: 1300,
      spending_by_category: { rent: 1500, groceries: 200 },
      category_percentages: { rent: 50.0, groceries: 6.67 },
      group_totals: { essentials: 1700, wants: 0, savings: 0, other: 0 },
      suggestions: [],
    },
  }),
  runInterestCalculation: vi.fn().mockResolvedValue({
    success: true,
    data: { monthly_payment: 1914.0, annual_payment: 22967.94 },
  }),
  isReady: vi.fn().mockReturnValue(true),
  default: {
    initializePyodide: vi.fn(),
    runCalculations: vi.fn(),
    runInterestCalculation: vi.fn(),
    isReady: vi.fn(),
  },
}));

vi.mock('../../src/services/fred', () => ({
  fetchAllRates: vi.fn().mockResolvedValue({
    success: true,
    rates: {
      mortgage: 6.59,
      federal_funds: 5.25,
      credit_card: 21.47,
      auto_loan: 7.89,
    },
    fromCache: false,
  }),
  default: {
    fetchAllRates: vi.fn(),
  },
}));

vi.mock('../../src/services/storage', () => ({
  saveTransactions: vi.fn().mockReturnValue({ success: true }),
  getTransactions: vi.fn().mockReturnValue([]),
  clearAll: vi.fn(),
  default: {
    saveTransactions: vi.fn(),
    getTransactions: vi.fn(),
    clearAll: vi.fn(),
  },
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
};

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

// ─── Rendering ────────────────────────────────────────────────────────────────

describe('Dashboard rendering', () => {
  it('renders without crashing', () => {
    renderDashboard();
    expect(screen.getByRole('navigation')).toBeTruthy();
  });

  it('renders welcome message', () => {
    renderDashboard();
    expect(screen.getByRole('banner')).toBeTruthy();
  });

  it('renders transaction form', () => {
    renderDashboard();
    expect(screen.getByText(/add transaction/i)).toBeTruthy();
  });

  it('renders empty transaction list', () => {
    renderDashboard();
    expect(screen.getByText(/no transactions added yet/i)).toBeTruthy();
  });

  it('does not show charts before calculate', () => {
    renderDashboard();
    expect(screen.queryByText(/budget summary/i)).toBeNull();
  });

  it('does not show debt calculator before calculate', () => {
    renderDashboard();
    expect(screen.queryByText(/debt & interest calculator/i)).toBeNull();
  });
});

// ─── Transaction management ───────────────────────────────────────────────────

describe('Dashboard transaction management', () => {
  it('adds a transaction when form is submitted', () => {
    renderDashboard();
    fireEvent.click(screen.getByText(/add transaction/i));
    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '1500' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^add$/i }));
    expect(screen.queryByText(/no transactions added yet/i)).toBeNull();
  });

  it('shows calculate button when transactions exist', () => {
    renderDashboard();
    fireEvent.click(screen.getByText(/add transaction/i));
    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '1500' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^add$/i }));
    expect(screen.getByRole('button', { name: /^calculate$/i })).toBeTruthy();
  });

  it('removes transaction when delete is clicked', () => {
    renderDashboard();
    fireEvent.click(screen.getByText(/add transaction/i));
    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '1500' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^add$/i }));
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(screen.getByText(/no transactions added yet/i)).toBeTruthy();
  });
});

// ─── Calculate flow ───────────────────────────────────────────────────────────

describe('Dashboard calculate flow', () => {
  it('shows budget summary after calculate', async () => {
    renderDashboard();
    fireEvent.click(screen.getByText(/add transaction/i));
    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '3000' },
    });
    fireEvent.change(screen.getByLabelText(/type/i), {
      target: { value: 'income' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^add$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^calculate$/i }));

    await screen.findByText(/budget summary/i);
    expect(screen.getByText(/budget summary/i)).toBeTruthy();
  });

  it('shows debt calculator after calculate', async () => {
    renderDashboard();
    fireEvent.click(screen.getByText(/add transaction/i));
    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '3000' },
    });
    fireEvent.change(screen.getByLabelText(/type/i), {
      target: { value: 'income' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^add$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^calculate$/i }));

    await screen.findByText(/debt & interest calculator/i);
    expect(screen.getByText(/debt & interest calculator/i)).toBeTruthy();
  });
});