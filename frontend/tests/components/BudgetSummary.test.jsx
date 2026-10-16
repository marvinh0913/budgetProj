/**
 * Tests for BudgetSummary component.
 * Covers rendering of income, expenses,
 * remaining balance and correct color coding.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BudgetSummary from '../../src/components/BudgetSummary';

// ─── Sample Data ─────────────────────────────────────────────────────────────

const POSITIVE_SUMMARY = {
  total_income: 3000,
  total_expenses: 2000,
  remaining_balance: 1000,
};

const NEGATIVE_SUMMARY = {
  total_income: 2000,
  total_expenses: 2500,
  remaining_balance: -500,
};

const ZERO_SUMMARY = {
  total_income: 2000,
  total_expenses: 2000,
  remaining_balance: 0,
};

// ─── Rendering ────────────────────────────────────────────────────────────────

describe('BudgetSummary rendering', () => {
  it('renders without crashing', () => {
    render(<BudgetSummary summary={POSITIVE_SUMMARY} />);
    expect(screen.getByText(/total income/i)).toBeTruthy();
  });

  it('displays total income', () => {
    render(<BudgetSummary summary={POSITIVE_SUMMARY} />);
    expect(screen.getByText(/3000/)).toBeTruthy();
  });

  it('displays total expenses', () => {
    render(<BudgetSummary summary={POSITIVE_SUMMARY} />);
    expect(screen.getByText(/2000/)).toBeTruthy();
  });

  it('displays remaining balance', () => {
    render(<BudgetSummary summary={POSITIVE_SUMMARY} />);
    expect(screen.getByText(/1000/)).toBeTruthy();
  });

  it('displays total expenses label', () => {
    render(<BudgetSummary summary={POSITIVE_SUMMARY} />);
    expect(screen.getByText(/total expenses/i)).toBeTruthy();
  });

  it('displays remaining balance label', () => {
    render(<BudgetSummary summary={POSITIVE_SUMMARY} />);
    expect(screen.getByText(/remaining balance/i)).toBeTruthy();
  });
});

// ─── Color coding ─────────────────────────────────────────────────────────────

describe('BudgetSummary color coding', () => {
  it('shows success color for positive balance', () => {
    const { container } = render(<BudgetSummary summary={POSITIVE_SUMMARY} />);
    expect(container.querySelector('.text-success')).toBeTruthy();
  });

  it('shows danger color for negative balance', () => {
    const { container } = render(<BudgetSummary summary={NEGATIVE_SUMMARY} />);
    expect(container.querySelector('.text-danger')).toBeTruthy();
  });

  it('shows warning color for zero balance', () => {
    const { container } = render(<BudgetSummary summary={ZERO_SUMMARY} />);
    expect(container.querySelector('.text-warning')).toBeTruthy();
  });
});
