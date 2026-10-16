import '../styles/budgetsummary.css';

function BudgetSummary({ summary }) {
  const { total_income, total_expenses, remaining_balance } = summary;

  const getBalanceClass = () => {
    if (remaining_balance > 0) return 'text-success';
    if (remaining_balance < 0) return 'text-danger';
    return 'text-warning';
  };

  return (
    <div className="budget-summary card">
      <h2 className="budget-summary-heading">Budget Summary</h2>
      <div className="budget-summary-grid">
        <div className="budget-summary-item">
          <span className="budget-summary-label">Total Income</span>
          <span className="budget-summary-value text-success">
            ${total_income.toFixed(2)}
          </span>
        </div>
        <div className="budget-summary-item">
          <span className="budget-summary-label">Total Expenses</span>
          <span className="budget-summary-value text-danger">
            ${total_expenses.toFixed(2)}
          </span>
        </div>
        <div className="budget-summary-item">
          <span className="budget-summary-label">Remaining Balance</span>
          <span className={`budget-summary-value ${getBalanceClass()}`}>
            ${remaining_balance.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default BudgetSummary;
