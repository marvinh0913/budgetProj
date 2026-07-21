/**
 * Tests for TransactionForm component.
 * Covers accordion toggle, form inputs,
 * validation, and adding transactions.
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TransactionForm from '../../src/components/TransactionForm';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mockOnAdd = vi.fn();

const renderForm = () => {
  return render(<TransactionForm onAdd={mockOnAdd} />);
};

// ─── Accordion ───────────────────────────────────────────────────────────────

describe('TransactionForm accordion', () => {
  it('renders without crashing', () => {
    renderForm();
    expect(screen.getByText(/add transaction/i)).toBeTruthy();
  });

  it('form inputs are hidden by default', () => {
    renderForm();
    expect(screen.queryByLabelText(/amount/i)).toBeNull();
  });

  it('form inputs show when accordion is opened', () => {
    renderForm();
    fireEvent.click(screen.getByText(/add transaction/i));
    expect(screen.getByLabelText(/amount/i)).toBeTruthy();
  });

  it('form inputs hide when accordion is closed again', () => {
    renderForm();
    fireEvent.click(screen.getByText(/add transaction/i));
    fireEvent.click(screen.getByText(/add transaction/i));
    expect(screen.queryByLabelText(/amount/i)).toBeNull();
  });
});

// ─── Form inputs ─────────────────────────────────────────────────────────────

describe('TransactionForm inputs', () => {
  it('renders amount input', () => {
    renderForm();
    fireEvent.click(screen.getByText(/add transaction/i));
    expect(screen.getByLabelText(/amount/i)).toBeTruthy();
  });

  it('renders category dropdown', () => {
    renderForm();
    fireEvent.click(screen.getByText(/add transaction/i));
    expect(screen.getByLabelText(/category/i)).toBeTruthy();
  });

  it('renders type dropdown', () => {
    renderForm();
    fireEvent.click(screen.getByText(/add transaction/i));
    expect(screen.getByLabelText(/type/i)).toBeTruthy();
  });

  it('amount input accepts numeric value', () => {
    renderForm();
    fireEvent.click(screen.getByText(/add transaction/i));
    const input = screen.getByLabelText(/amount/i);
    fireEvent.change(input, { target: { value: '1500' } });
    expect(input.value).toBe('1500');
  });

  it('amount input accepts zero', () => {
    renderForm();
    fireEvent.click(screen.getByText(/add transaction/i));
    const input = screen.getByLabelText(/amount/i);
    fireEvent.change(input, { target: { value: '0' } });
    expect(input.value).toBe('0');
  });

  it('category dropdown has correct options', () => {
    renderForm();
    fireEvent.click(screen.getByText(/add transaction/i));
    expect(screen.getByRole('option', { name: /rent/i })).toBeTruthy();
    expect(screen.getByRole('option', { name: /groceries/i })).toBeTruthy();
    expect(screen.getByRole('option', { name: /other/i })).toBeTruthy();
  });

  it('type dropdown has income and expense options', () => {
    renderForm();
    fireEvent.click(screen.getByText(/add transaction/i));
    expect(screen.getByRole('option', { name: /income/i })).toBeTruthy();
    expect(screen.getByRole('option', { name: /expense/i })).toBeTruthy();
  });
});

// ─── Add transaction ──────────────────────────────────────────────────────────

describe('TransactionForm adding', () => {
  it('calls onAdd when form is submitted with valid data', () => {
    renderForm();
    fireEvent.click(screen.getByText(/add transaction/i));

    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '1500' },
    });
    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: 'rent' },
    });
    fireEvent.change(screen.getByLabelText(/type/i), {
      target: { value: 'expense' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^add$/i }));
    expect(mockOnAdd).toHaveBeenCalledWith({
      amount: 1500,
      category: 'rent',
      type: 'expense',
    });
  });

  it('does not call onAdd when amount is empty', () => {
    renderForm();
    fireEvent.click(screen.getByText(/add transaction/i));
    fireEvent.click(screen.getByRole('button', { name: /^add$/i }));
    expect(mockOnAdd).not.toHaveBeenCalledWith();
  });

  it('resets form after successful add', () => {
    renderForm();
    fireEvent.click(screen.getByText(/add transaction/i));

    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: '1500' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^add$/i }));

    expect(screen.getByLabelText(/amount/i).value).toBe('');
  });
});
