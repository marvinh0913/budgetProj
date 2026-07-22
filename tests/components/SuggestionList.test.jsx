/**
 * Tests for SuggestionList component.
 * Covers rendering of budget suggestions
 * and empty state when no suggestions exist.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SuggestionList from '../../src/components/SuggestionList';

// ─── Sample Data ─────────────────────────────────────────────────────────────

const SAMPLE_SUGGESTIONS = [
  {
    group: 'essentials',
    current_amount: 1700,
    current_percentage: 56.67,
    recommended_percentage: 50.0,
    recommended_amount: 1500,
    difference: 200,
    message: 'Your essentials spending is 56.67% of income. Consider reducing by $200.',
  },
  {
    group: 'wants',
    current_amount: 1000,
    current_percentage: 33.33,
    recommended_percentage: 30.0,
    recommended_amount: 900,
    difference: 100,
    message: 'Your wants spending is 33.33% of income. Consider reducing by $100.',
  },
];

// ─── Rendering ────────────────────────────────────────────────────────────────

describe('SuggestionList rendering', () => {
  it('renders without crashing', () => {
    render(<SuggestionList suggestions={SAMPLE_SUGGESTIONS} />);
    expect(screen.getByText(/budget suggestions/i)).toBeTruthy();
  });

  it('renders correct number of suggestions', () => {
    const { container } = render(
      <SuggestionList suggestions={SAMPLE_SUGGESTIONS} />
    );
    expect(container.querySelectorAll('.suggestion-item').length).toBe(2);
  });

  it('displays suggestion message', () => {
    render(<SuggestionList suggestions={SAMPLE_SUGGESTIONS} />);
    expect(screen.getByText(/consider reducing by \$200/i)).toBeTruthy();
  });

  it('displays group name', () => {
    const { container } = render(<SuggestionList suggestions={SAMPLE_SUGGESTIONS} />);
    expect(container.querySelector('.suggestion-item-group').textContent).toMatch(/essentials/i);
  });

  it('shows empty state when no suggestions', () => {
    render(<SuggestionList suggestions={[]} />);
    expect(screen.getByText(/your budget looks great/i)).toBeTruthy();
  });

  it('does not show empty state when suggestions exist', () => {
    render(<SuggestionList suggestions={SAMPLE_SUGGESTIONS} />);
    expect(screen.queryByText(/your budget looks great/i)).toBeNull();
  });

  it('displays difference amount', () => {
    const { container } = render(<SuggestionList suggestions={SAMPLE_SUGGESTIONS} />);
    expect(container.querySelector('.suggestion-item-difference').textContent).toMatch(/200/);
  });
});
