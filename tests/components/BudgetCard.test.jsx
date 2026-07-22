/**
 * Tests for BudgetCard component.
 * Covers rendering of group name, actual vs recommended
 * spending, and correct color coding based on budget status.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BudgetCard from '../../src/components/BudgetCard';

// ─── Sample Data ─────────────────────────────────────────────────────────────

const OVER_BUDGET = {
  group: 'essentials',
  current_amount: 1700,
  current_percentage: 56.67,
  recommended_percentage: 50.0,
  recommended_amount: 1500,
  difference: 200,
  message: 'Your essentials spending is 56.67% of income. Consider reducing by $200.',
};

const UNDER_BUDGET = {
  group: 'wants',
  current_amount: 100,
  current_percentage: 3.33,
  recommended_percentage: 30.0,
  recommended_amount: 900,
  difference: -800,
  message: 'Your wants spending is within the recommended range.',
};

const AT_BUDGET = {
  group: 'savings',
  current_amount: 600,
  current_percentage: 20.0,
  recommended_percentage: 20.0,
  recommended_amount: 600,
  difference: 0,
  message: 'Your savings are right on target.',
};

// ─── Rendering ────────────────────────────────────────────────────────────────

describe('BudgetCard rendering', () => {
  it('renders without crashing', () => {
    const { container } = render(<BudgetCard data={OVER_BUDGET} />);
     expect(container.querySelector('.budget-card')).toBeTruthy();
  });

  it('displays group name', () => {
    render(<BudgetCard data={OVER_BUDGET} />);
    expect(screen.getByRole('heading', { name: /essentials/i })).toBeTruthy();
  });

  it('displays current amount', () => {
    render(<BudgetCard data={OVER_BUDGET} />);
    expect(screen.getByText(/1700/)).toBeTruthy();
  });

  it('displays current percentage', () => {
    render(<BudgetCard data={OVER_BUDGET} />);
    expect(screen.getByText('56.67%')).toBeTruthy();
  });

  it('displays recommended percentage', () => {
    render(<BudgetCard data={OVER_BUDGET} />);
    expect(screen.getByText('50%')).toBeTruthy();
  });

  it('displays message', () => {
    render(<BudgetCard data={OVER_BUDGET} />);
    expect(screen.getByText(/consider reducing/i)).toBeTruthy();
  });
});

// ─── Color coding ─────────────────────────────────────────────────────────────

describe('BudgetCard color coding', () => {
  it('shows danger color when over budget', () => {
    const { container } = render(<BudgetCard data={OVER_BUDGET} />);
    expect(container.querySelector('.text-danger')).toBeTruthy();
  });

  it('shows success color when under budget', () => {
    const { container } = render(<BudgetCard data={UNDER_BUDGET} />);
    expect(container.querySelector('.text-success')).toBeTruthy();
  });

  it('shows warning color when at budget', () => {
    const { container } = render(<BudgetCard data={AT_BUDGET} />);
    expect(container.querySelector('.text-warning')).toBeTruthy();
  });
});
