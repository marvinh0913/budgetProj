import '../styles/suggestionlist.css';

function SuggestionList({ suggestions }) {
  if (suggestions.length === 0) {
    return (
      <div className="suggestion-list card">
        <h2 className="suggestion-list-heading">Budget Suggestions</h2>
        <p className="suggestion-list-empty">
          Your budget looks great! You are within all recommended ranges.
        </p>
      </div>
    );
  }

  return (
    <div className="suggestion-list card">
      <h2 className="suggestion-list-heading">Budget Suggestions</h2>
      <ul className="suggestion-list-items">
        {suggestions.map((suggestion) => (
          <li key={suggestion.group} className="suggestion-item">
            <div className="suggestion-item-header">
              <span className="suggestion-item-group">{suggestion.group}</span>
              <span className="suggestion-item-difference text-danger">
                ${suggestion.difference.toFixed(2)} over
              </span>
            </div>
            <p className="suggestion-item-message">{suggestion.message}</p>
            <div className="suggestion-item-stats">
              <span className="suggestion-item-stat">
                Current: {suggestion.current_percentage}%
              </span>
              <span className="suggestion-item-stat">
                Recommended: {suggestion.recommended_percentage}%
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SuggestionList;
