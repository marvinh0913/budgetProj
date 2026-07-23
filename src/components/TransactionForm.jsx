import { useState } from 'react';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import '../styles/transactionform.css';

const CATEGORIES = [
  'rent',
  'mortgage',
  'utilities',
  'groceries',
  'transportation',
  'insurance',
  'healthcare',
  'minimum_debt_payments',
  'dining',
  'entertainment',
  'shopping',
  'subscriptions',
  'travel',
  'personal_care',
  'hobbies',
  'savings',
  'investments',
  'emergency_fund',
  'retirement',
  'paycheck',
  'other',
];

function TransactionForm({ onAdd }) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('rent');
  const [type, setType] = useState('expense');

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleAdd = () => {
    if (amount === '') return;

    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount < 0) return;

    onAdd({
      amount: parsedAmount,
      category,
      type,
    });

    // Reset form
    setAmount('');
    setCategory('rent');
    setType('expense');
  };

  return (
    <div className="transaction-form card">
      <button className="transaction-form-toggle btn" onClick={handleToggle}>
        <span>Add Item</span>
        {isOpen ? (
          <ChevronUpIcon className="form-icon" />
        ) : (
          <ChevronDownIcon className="form-icon" />
        )}
      </button>

      {isOpen && (
        <div className="transaction-form-body">
          <div className="form-group">
            <label className="form-label" htmlFor="amount">
              Amount
            </label>
            <input
              id="amount"
              type="number"
              className="form-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
            {amount !== '' && parseFloat(amount) < 0 && (
              <span className="form-error">Amount cannot be negative</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="category">
              Category
            </label>
            <select
              id="category"
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="type">
              Type
            </label>
            <select
              id="type"
              className="form-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="expense">expense</option>
              <option value="income">income</option>
            </select>
          </div>

          <button className="btn btn-primary" onClick={handleAdd}>
            <PlusIcon className="form-icon" />
            Add
          </button>
        </div>
      )}
    </div>
  );
}

export default TransactionForm;
