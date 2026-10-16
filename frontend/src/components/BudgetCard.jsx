import '../styles/budgetcard.css';

function BudgetCard({ data }) {
  const {
    group,
    current_amount,
    current_percentage,
    recommended_percentage,
    recommended_amount,
    difference,
    message,
  } = data;

  const getStatusClass = () => {
    if (difference > 0) return 'text-danger';
    if (difference < 0) return 'text-success';
    return 'text-warning';
  };

  return (
    <div className="budget-card card">
      <h3 className="budget-card-group">{group}</h3>
      <div className="budget-card-stats">
        <div className="budget-card-stat">
          <span className="budget-card-label">Current</span>
          <span className={`budget-card-value ${getStatusClass()}`}>
            ${current_amount.toFixed(2)}
          </span>
          <span className="budget-card-percentage">
            {`${current_percentage}%`}
          </span>
        </div>
        <div className="budget-card-divider" />
        <div className="budget-card-stat">
          <span className="budget-card-label">Recommended</span>
          <span className="budget-card-value text-primary">
            ${recommended_amount.toFixed(2)}
          </span>
          <span className="budget-card-percentage">
            {`${recommended_percentage}%`}
          </span>
        </div>
      </div>
      <p className="budget-card-message">{message}</p>
    </div>
  );
}

export default BudgetCard;
