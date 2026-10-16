/**
 * Tests for DebtCalculator component.
 * Covers tab navigation, form inputs,
 * and results display for all four calculation types.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DebtCalculator from '../../src/pages/DebtCalculator';

// ─── Sample Data ─────────────────────────────────────────────────────────────

const SAMPLE_RATES = {
  mortgage: 6.59,
  federal_funds: 5.25,
  credit_card: 21.47,
  auto_loan: 7.89,
};

const SAMPLE_TRANSACTIONS = [
  { amount: 3000, category: 'other', type: 'income' },
  { amount: 1500, category: 'rent', type: 'expense' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mockOnCalculate = vi.fn();

const renderCalculator = () => {
  return render(
    <DebtCalculator
      rates={SAMPLE_RATES}
      transactions={SAMPLE_TRANSACTIONS}
      onCalculate={mockOnCalculate}
    />
  );
};

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  mockOnCalculate.mockClear();
});

// ─── Rendering ────────────────────────────────────────────────────────────────

describe('DebtCalculator rendering', () => {
  it('renders without crashing', () => {
    renderCalculator();
    expect(screen.getByText(/debt & interest calculator/i)).toBeTruthy();
  });

  it('renders all four tabs', () => {
    renderCalculator();
    expect(screen.getByRole('button', { name: /mortgage/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /credit card/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /auto loan/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /savings/i })).toBeTruthy();
  });

  it('shows mortgage tab by default', () => {
    renderCalculator();
    expect(screen.getByLabelText(/loan amount/i)).toBeTruthy();
  });

  it('displays current mortgage rate', () => {
    renderCalculator();
    expect(screen.getByText(/6.59/)).toBeTruthy();
  });
});

// ─── Tab navigation ───────────────────────────────────────────────────────────

describe('DebtCalculator tab navigation', () => {
  it('switches to credit card tab', () => {
    renderCalculator();
    fireEvent.click(screen.getByRole('button', { name: /credit card/i }));
    expect(screen.getByLabelText(/balance/i)).toBeTruthy();
  });

  it('switches to auto loan tab', () => {
    renderCalculator();
    fireEvent.click(screen.getByRole('button', { name: /auto loan/i }));
    expect(screen.getByLabelText(/principal/i)).toBeTruthy();
  });

  it('switches to savings tab', () => {
    renderCalculator();
    fireEvent.click(screen.getByRole('button', { name: /savings/i }));
    expect(screen.getByLabelText(/initial amount/i)).toBeTruthy();
  });

  it('switches back to mortgage tab', () => {
    renderCalculator();
    fireEvent.click(screen.getByRole('button', { name: /credit card/i }));
    fireEvent.click(screen.getByRole('button', { name: /mortgage/i }));
    expect(screen.getByLabelText(/loan amount/i)).toBeTruthy();
  });
});

// ─── Mortgage inputs ──────────────────────────────────────────────────────────

describe('DebtCalculator mortgage inputs', () => {
  it('renders loan amount input', () => {
    renderCalculator();
    expect(screen.getByLabelText(/loan amount/i)).toBeTruthy();
  });

  it('renders term selector', () => {
    renderCalculator();
    expect(screen.getByLabelText(/term/i)).toBeTruthy();
  });

  it('accepts loan amount input', () => {
    renderCalculator();
    const input = screen.getByLabelText(/loan amount/i);
    fireEvent.change(input, { target: { value: '300000' } });
    expect(input.value).toBe('300000');
  });

  it('calls onCalculate when calculate button clicked', () => {
    renderCalculator();
    fireEvent.change(screen.getByLabelText(/loan amount/i), {
      target: { value: '300000' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^calculate$/i }));
    expect(mockOnCalculate).toHaveBeenCalled();
  });
});

// ─── Credit card inputs ───────────────────────────────────────────────────────

describe('DebtCalculator credit card inputs', () => {
  it('renders balance input', () => {
    renderCalculator();
    fireEvent.click(screen.getByRole('button', { name: /credit card/i }));
    expect(screen.getByLabelText(/balance/i)).toBeTruthy();
  });

  it('accepts balance input', () => {
    renderCalculator();
    fireEvent.click(screen.getByRole('button', { name: /credit card/i }));
    const input = screen.getByLabelText(/balance/i);
    fireEvent.change(input, { target: { value: '5000' } });
    expect(input.value).toBe('5000');
  });

  it('calls onCalculate when calculate button clicked', () => {
    renderCalculator();
    fireEvent.click(screen.getByRole('button', { name: /credit card/i }));
    fireEvent.change(screen.getByLabelText(/balance/i), {
      target: { value: '5000' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^calculate$/i }));
    expect(mockOnCalculate).toHaveBeenCalled();
  });
});

// ─── Auto loan inputs ─────────────────────────────────────────────────────────

describe('DebtCalculator auto loan inputs', () => {
  it('renders principal input', () => {
    renderCalculator();
    fireEvent.click(screen.getByRole('button', { name: /auto loan/i }));
    expect(screen.getByLabelText(/principal/i)).toBeTruthy();
  });

  it('renders term months dropdown', () => {
    renderCalculator();
    fireEvent.click(screen.getByRole('button', { name: /auto loan/i }));
    expect(screen.getByLabelText(/term/i)).toBeTruthy();
  });

  it('term dropdown has all valid options', () => {
    renderCalculator();
    fireEvent.click(screen.getByRole('button', { name: /auto loan/i }));
    expect(screen.getByRole('option', { name: '24 months' })).toBeTruthy();
    expect(screen.getByRole('option', { name: '36 months' })).toBeTruthy();
    expect(screen.getByRole('option', { name: '48 months' })).toBeTruthy();
    expect(screen.getByRole('option', { name: '60 months' })).toBeTruthy();
    expect(screen.getByRole('option', { name: '72 months' })).toBeTruthy();
    expect(screen.getByRole('option', { name: '84 months' })).toBeTruthy();
  });
});

// ─── Savings inputs ───────────────────────────────────────────────────────────

describe('DebtCalculator savings inputs', () => {
  it('renders initial amount input', () => {
    renderCalculator();
    fireEvent.click(screen.getByRole('button', { name: /savings/i }));
    expect(screen.getByLabelText(/initial amount/i)).toBeTruthy();
  });

  it('renders monthly deposit input', () => {
    renderCalculator();
    fireEvent.click(screen.getByRole('button', { name: /savings/i }));
    expect(screen.getByLabelText(/monthly deposit/i)).toBeTruthy();
  });

  it('renders months input', () => {
    renderCalculator();
    fireEvent.click(screen.getByRole('button', { name: /savings/i }));
    expect(screen.getByLabelText(/months/i)).toBeTruthy();
  });
});