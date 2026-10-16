/**
 * Tests for SpendingBreakdown chart component.
 * Covers rendering with data and empty state.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SpendingBreakdown from '../../../src/components/charts/SpendingBreakdown';

// ─── Sample Data ─────────────────────────────────────────────────────────────

const SAMPLE_DATA = {
  rent: 1500,
  groceries: 200,
  dining: 100,
  savings: 200,
};

// ─── Rendering ────────────────────────────────────────────────────────────────

describe('SpendingBreakdown rendering', () => {
  it('renders without crashing', () => {
    const { container } = render(<SpendingBreakdown data={SAMPLE_DATA} />);
    expect(container.querySelector('.spending-breakdown')).toBeTruthy();
  });

  it('renders chart heading', () => {
    render(<SpendingBreakdown data={SAMPLE_DATA} />);
    expect(screen.getByText(/spending breakdown/i)).toBeTruthy();
  });

  it('renders doughnut chart', () => {
    render(<SpendingBreakdown data={SAMPLE_DATA} />);
    expect(screen.getByTestId('doughnut-chart')).toBeTruthy();
  });

  it('shows empty state when no data', () => {
    render(<SpendingBreakdown data={{}} />);
    expect(screen.getByText(/no spending data/i)).toBeTruthy();
  });

  it('does not show empty state when data exists', () => {
    render(<SpendingBreakdown data={SAMPLE_DATA} />);
    expect(screen.queryByText(/no spending data/i)).toBeNull();
  });
});