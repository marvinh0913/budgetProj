/**
 * Tests for TransactionList component.
 * Covers rendering transactions, delete button,
 * and undo functionality with 5 second timer.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import TransactionList from '../../src/components/TransactionList';

// ─── Sample Data ─────────────────────────────────────────────────────────────

const SAMPLE_TRANSACTIONS = [
  { id: 1, amount: 3000, category: 'other', type: 'income' },
  { id: 2, amount: 1500, category: 'rent', type: 'expense' },
  { id: 3, amount: 200, category: 'groceries', type: 'expense' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mockOnDelete = vi.fn();
const mockOnUndo = vi.fn();

const renderList = (transactions = SAMPLE_TRANSACTIONS) => {
  return render(
    <TransactionList
      transactions={transactions}
      onDelete={mockOnDelete}
      onUndo={mockOnUndo}
    />
  );
};

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  mockOnDelete.mockClear();
  mockOnUndo.mockClear();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

// ─── Rendering ───────────────────────────────────────────────────────────────

describe('TransactionList rendering', () => {
  it('renders without crashing', () => {
    renderList();
    expect(screen.getByRole('list')).toBeTruthy();
  });

  it('renders correct number of transactions', () => {
    renderList();
    expect(screen.getAllByRole('listitem').length).toBe(3);
  });

  it('renders empty message when no transactions', () => {
    renderList([]);
    expect(screen.getByText(/no transactions added yet/i)).toBeTruthy();
  });

  it('displays transaction amount', () => {
    renderList();
    expect(screen.getByText(/3000/)).toBeTruthy();
  });

  it('displays transaction category', () => {
    renderList();
    expect(screen.getByText(/rent/i)).toBeTruthy();
  });

  it('displays transaction type', () => {
    renderList();
    expect(screen.getByText(/income/i)).toBeTruthy();
  });
});

// ─── Delete ───────────────────────────────────────────────────────────────────

describe('TransactionList delete', () => {
  it('renders delete button for each transaction', () => {
    renderList();
    expect(screen.getAllByRole('button', { name: /delete/i }).length).toBe(3);
  });

  it('calls onDelete when delete button clicked', () => {
    renderList();
    fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]);
    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });

  it('shows undo button after delete', () => {
    renderList();
    fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]);
    expect(screen.getByRole('button', { name: /undo/i })).toBeTruthy();
  });
});

// ─── Undo ─────────────────────────────────────────────────────────────────────

describe('TransactionList undo', () => {
  it('calls onUndo when undo button clicked', () => {
    renderList();
    fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: /undo/i }));
    expect(mockOnUndo).toHaveBeenCalled();
  });

  it('undo button disappears after 5 seconds', () => {
    renderList();
    fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]);
    expect(screen.getByRole('button', { name: /undo/i })).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.queryByRole('button', { name: /undo/i })).toBeNull();
  });

  it('undo button disappears before 5 seconds if clicked', () => {
    renderList();
    fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: /undo/i }));
    expect(screen.queryByRole('button', { name: /undo/i })).toBeNull();
  });
});
