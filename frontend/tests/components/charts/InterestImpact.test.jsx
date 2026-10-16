/**
 * Tests for InterestImpact chart component.
 * Covers rendering with savings growth data and empty state.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import InterestImpact from '../../../src/components/charts/InterestImpact';

// ─── Sample Data ─────────────────────────────────────────────────────────────

const SAMPLE_DATA = {
  final_balance: 3652.32,
  total_deposited: 3400,
  interest_earned: 252.32,
  annual_projection: 3845.21,
  monthly_rate: 0.4375,
  message: 'After 12 months your savings will grow to $3652.32',
};

// ─── Rendering ────────────────────────────────────────────────────────────────

describe('InterestImpact rendering', () => {
  it('renders without crashing', () => {
    const { container } = render(<InterestImpact data={SAMPLE_DATA} />);
    expect(container.querySelector('.interest-impact')).toBeTruthy();
  });

  it('renders chart heading', () => {
    render(<InterestImpact data={SAMPLE_DATA} />);
    expect(screen.getByText(/interest impact/i)).toBeTruthy();
  });

  it('renders line chart', () => {
    render(<InterestImpact data={SAMPLE_DATA} />);
    expect(screen.getByTestId('line-chart')).toBeTruthy();
  });

  it('displays final balance', () => {
    render(<InterestImpact data={SAMPLE_DATA} />);
    expect(screen.getByText(/3652.32/)).toBeTruthy();
  });

  it('displays interest earned', () => {
    render(<InterestImpact data={SAMPLE_DATA} />);
    expect(screen.getByText(/252.32/)).toBeTruthy();
  });

  it('shows empty state when no data', () => {
    render(<InterestImpact data={null} />);
    expect(screen.getByText(/no interest data/i)).toBeTruthy();
  });

  it('does not show empty state when data exists', () => {
    render(<InterestImpact data={SAMPLE_DATA} />);
    expect(screen.queryByText(/no interest data/i)).toBeNull();
  });
});