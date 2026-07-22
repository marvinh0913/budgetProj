import { useState, useEffect } from 'react';
import { TrashIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import '../styles/transactionlist.css';

function TransactionList({ transactions, onDelete, onUndo }) {
  const [showUndo, setShowUndo] = useState(false);

  const handleDelete = (id) => {
    onDelete(id);
    setShowUndo(true);
  };

  const handleUndo = () => {
    onUndo();
    setShowUndo(false);
  };

  useEffect(() => {
    if (!showUndo) return;

    const timer = setTimeout(() => {
      setShowUndo(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [showUndo]);

  if (transactions.length === 0) {
    return (
      <div className="transaction-list-empty card">
        <p>No transactions added yet.</p>
      </div>
    );
  }

  return (
    <div className="transaction-list card">
      {showUndo && (
        <div className="undo-bar">
          <span>Transaction deleted.</span>
          <button
            className="btn btn-warning"
            onClick={handleUndo}
            aria-label="undo"
          >
            <ArrowUturnLeftIcon className="list-icon" />
            Undo
          </button>
        </div>
      )}
      <ul role="list" className="transaction-list-items">
        {transactions.map((t) => (
          <li key={t.id} role="listitem" className="transaction-list-item">
            <div className="transaction-list-info">
              <span className={`transaction-type ${t.type}`}>
                {t.type}
              </span>
              <span className="transaction-category">
                {t.category.replace(/_/g, ' ')}
              </span>
              <span className="transaction-amount">
                ${t.amount.toFixed(2)}
              </span>
            </div>
            <button
              className="btn btn-danger"
              onClick={() => handleDelete(t.id)}
              aria-label="delete"
            >
              <TrashIcon className="list-icon" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TransactionList;
