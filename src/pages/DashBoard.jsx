import { useState, useEffect } from 'react';
import { CalculatorIcon } from '@heroicons/react/24/outline';
import NavBar from '../components/NavBar';
import WelcomeMessage from '../components/WelcomeMessage';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import BudgetSummary from '../components/BudgetSummary';
import BudgetCard from '../components/BudgetCard';
import SuggestionList from '../components/SuggestionList';
import SpendingBreakdown from '../components/charts/SpendingBreakdown';
import BudgetVsActual from '../components/charts/BudgetVsActual';
import DebtCalculator from './DebtCalculator';
import { runCalculations, runInterestCalculation } from '../services/pyodide';
import { fetchAllRates } from '../services/fred';
import { saveTransactions, getTransactions } from '../services/storage';
import '../styles/dashboard.css';

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [deletedTransaction, setDeletedTransaction] = useState(null);
  const [summary, setSummary] = useState(null);
  const [interestResult, setInterestResult] = useState(null);
  const [rates, setRates] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [nextId, setNextId] = useState(1);

  // Load transactions from storage and fetch rates on mount
  useEffect(() => {
    const stored = getTransactions();
    if (stored.length > 0) {
      setTransactions(stored);
      const maxId = Math.max(...stored.map((t) => t.id || 0));
      setNextId(maxId + 1);
    }

    fetchAllRates().then((result) => {
      if (result.success) {
        setRates(result.rates);
      }
    });
  }, []);

  const handleAdd = (transaction) => {
    const newTransaction = { ...transaction, id: nextId };
    const updated = [...transactions, newTransaction];
    setTransactions(updated);
    setNextId((prev) => prev + 1);
    saveTransactions(updated);
  };

  const handleDelete = (id) => {
    const deleted = transactions.find((t) => t.id === id);
    setDeletedTransaction(deleted);
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    saveTransactions(updated);
  };

  const handleUndo = () => {
    if (!deletedTransaction) return;
    const updated = [...transactions, deletedTransaction];
    setTransactions(updated);
    saveTransactions(updated);
    setDeletedTransaction(null);
  };

  const handleCalculate = async () => {
    if (transactions.length === 0) return;
    setIsCalculating(true);

    const result = await runCalculations(transactions);
    if (result.success) {
      setSummary(result.data);
      setHasCalculated(true);
    }

    setIsCalculating(false);
  };

  const handleInterestCalculation = async (type, data) => {
    const result = await runInterestCalculation(type, data);
    if (result.success) {
      setInterestResult(result.data);
    }
  };

  return (
    <div className="dashboard">
      <NavBar />
      <div className="container page">
        <WelcomeMessage hasTransactions={transactions.length > 0} />

        <TransactionForm onAdd={handleAdd} />

        <TransactionList
          transactions={transactions}
          onDelete={handleDelete}
          onUndo={handleUndo}
        />

        {transactions.length > 0 && (
          <button
            className="btn btn-success calculate-btn"
            onClick={handleCalculate}
            disabled={isCalculating}
            aria-label="calculate"
          >
            <CalculatorIcon className="btn-icon" />
            {isCalculating ? 'Calculating...' : 'Calculate'}
          </button>
        )}

        {hasCalculated && summary && (
          <>
            <hr className="divider" />
            <BudgetSummary summary={summary} />

            <div className="budget-cards-grid">
              {Object.entries(summary.group_totals)
                .filter(([group]) => group !== 'other')
                .map(([group, amount]) => (
                  <BudgetCard
                    key={group}
                    data={{
                      group,
                      current_amount: amount,
                      current_percentage:
                        summary.total_income > 0
                          ? Math.round((amount / summary.total_income) * 100)
                          : 0,
                      recommended_percentage:
                        group === 'essentials'
                          ? 50
                          : group === 'wants'
                            ? 30
                            : 20,
                      recommended_amount:
                        summary.total_income > 0
                          ? Math.round(
                              ((group === 'essentials'
                                ? 50
                                : group === 'wants'
                                  ? 30
                                  : 20) /
                                100) *
                                summary.total_income
                            )
                          : 0,
                      difference:
                        amount -
                        (summary.total_income > 0
                          ? Math.round(
                              ((group === 'essentials'
                                ? 50
                                : group === 'wants'
                                  ? 30
                                  : 20) /
                                100) *
                                summary.total_income
                            )
                          : 0),
                      message: `Your ${group} spending is ${
                        summary.total_income > 0
                          ? Math.round((amount / summary.total_income) * 100)
                          : 0
                      }% of income.`,
                    }}
                  />
                ))}
            </div>

            <SuggestionList suggestions={summary.suggestions} />

            <div className="charts-grid">
              <SpendingBreakdown data={summary.spending_by_category} />
              <BudgetVsActual
                data={summary.group_totals}
                income={summary.total_income}
              />
            </div>

            {rates && (
              <DebtCalculator
                rates={rates}
                transactions={transactions}
                onCalculate={handleInterestCalculation}
              />
            )}

            {interestResult && (
              <div className="interest-result card">
                <h3>Calculation Result</h3>
                {Object.entries(interestResult).map(
                  ([key, value]) =>
                    typeof value === 'number' && (
                      <div key={key} className="interest-result-item">
                        <span className="interest-result-label">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span className="interest-result-value">
                          ${value.toFixed(2)}
                        </span>
                      </div>
                    )
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
