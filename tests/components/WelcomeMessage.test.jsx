/**
 * Tests for WelcomeMessage component.
 * Covers rendering of intro text and
 * visibility after transactions are added.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import WelcomeMessage from '../../src/components/WelcomeMessage';

// ─── Rendering ────────────────────────────────────────────────────────────────

describe('WelcomeMessage rendering', () => {
  it('renders without crashing', () => {
    render(<WelcomeMessage />);
    expect(screen.getByRole('banner')).toBeTruthy();
  });

  it('displays welcome heading', () => {
    render(<WelcomeMessage />);
    expect(screen.getByText(/welcome to budgetproj/i)).toBeTruthy();
  });

  it('displays how to use instructions', () => {
    render(<WelcomeMessage />);
    expect(screen.getByText(/add your transactions/i)).toBeTruthy();
  });

  it('displays calculate instruction', () => {
    render(<WelcomeMessage />);
    expect(screen.getByText(/click calculate/i)).toBeTruthy();
  });

  it('remains visible when transactions exist', () => {
    render(<WelcomeMessage hasTransactions={true} />);
    expect(screen.getByRole('banner')).toBeTruthy();
  });

  it('remains visible when no transactions exist', () => {
    render(<WelcomeMessage hasTransactions={false} />);
    expect(screen.getByRole('banner')).toBeTruthy();
  });
});
