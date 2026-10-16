/**
 * Tests for BudgetVsActual chart component.
 * Covers rendering with group totals data and empty state.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BudgetVsActual from '../../../src/components/charts/BudgetVsActual';

// ─── Sample Data ─────────────────────────────────────────────────────────────

const SAMPLE_DATA = {
  essentials: 1700,
  wants: 100,
  savings: 200,
  other: 0,
};

// ─── Rendering ────────────────────────────────────────────────────────────────

describe('BudgetVsActual rendering', () => {
  it('renders without crashing', () => {
    const { container } = render(<BudgetVsActual data={SAMPLE_DATA} income={3000} />);
    expect(container.querySelector('.budget-vs-actual')).toBeTruthy();
  });

  it('renders chart heading', () => {
    render(<BudgetVsActual data={SAMPLE_DATA} income={3000} />);
    expect(screen.getByText(/budget vs actual/i)).toBeTruthy();
  });

  it('renders bar chart', () => {
    render(<BudgetVsActual data={SAMPLE_DATA} income={3000} />);
    expect(screen.getByTestId('bar-chart')).toBeTruthy();
  });

  it('shows empty state when no data', () => {
    render(<BudgetVsActual data={{}} income={0} />);
    expect(screen.getByText(/no budget data/i)).toBeTruthy();
  });

  it('does not show empty state when data exists', () => {
    render(<BudgetVsActual data={SAMPLE_DATA} income={3000} />);
    expect(screen.queryByText(/no budget data/i)).toBeNull();
  });
});