import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import BudgetImpact from '../components/charts/BudgetImpact';
import { getTransactions } from '../services/storage';
import { buildScenarios, summarizeBudget } from '../utils/budgetScenarios';
import NavBar from '../components/NavBar';
import AffordabilityResults from '../components/AffordabilityResults';
import {
  estimateAffordability,
  getProfile,
  isLoggedIn,
  saveProfile,
} from '../services/api';
import '../styles/affordability.css';

const MONEY_FIELDS = [
  {
    name: 'gross_monthly_income',
    label: 'Gross monthly income',
    hint: 'Before taxes',
  },
  {
    name: 'monthly_debt_payments',
    label: 'Monthly debt payments',
    hint: 'Car loans, student loans, credit card minimums. Not rent or groceries.',
  },
  {
    name: 'down_payment_savings',
    label: 'Savings for a home down payment',
  },
];

const EMPTY_FORM = {
  gross_monthly_income: '',
  monthly_debt_payments: '',
  down_payment_savings: '',
  mortgage_term_years: '30',
  auto_term_months: '48',
  auto_down_payment: '0',
};

function Affordability() {
  const loggedIn = isLoggedIn();
  const [form, setForm] = useState(EMPTY_FORM);
  const [saveToProfile, setSaveToProfile] = useState(loggedIn);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // The dashboard's saved budget, read once when the page opens
  const budget = useMemo(() => summarizeBudget(getTransactions()), []);

  // Logged-in users: fill the form from their saved profile
  useEffect(() => {
    if (!loggedIn) return undefined;
    let cancelled = false;

    getProfile()
      .then((profile) => {
        if (cancelled || !profile) return;
        setForm((prev) => ({
          ...prev,
          gross_monthly_income: String(profile.gross_monthly_income),
          monthly_debt_payments: String(profile.monthly_debt_payments),
          down_payment_savings: String(profile.down_payment_savings),
        }));
      })
      .catch(() => {
        // Prefilling is a convenience; the form still works empty
      });

    return () => {
      cancelled = true;
    };
  }, [loggedIn]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const profile = {
      gross_monthly_income: Number(form.gross_monthly_income),
      monthly_debt_payments: Number(form.monthly_debt_payments),
      down_payment_savings: Number(form.down_payment_savings),
    };

    try {
      if (loggedIn && saveToProfile) {
        await saveProfile(profile);
      }
      const data = await estimateAffordability({
        ...profile,
        mortgage_term_years: Number(form.mortgage_term_years),
        auto_term_months: Number(form.auto_term_months),
        auto_down_payment: Number(form.auto_down_payment || 0),
      });
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="affordability">
      <NavBar />
      <div className="container page">
        <h1>What can I afford?</h1>
        <p>
          Estimates for a home and a car, using your numbers and current
          interest rates from the Federal Reserve.
        </p>

        <form className="card affordability-form" onSubmit={handleSubmit}>
          {MONEY_FIELDS.map((field) => (
            <div className="form-group" key={field.name}>
              <label className="form-label" htmlFor={field.name}>
                {field.label}
              </label>
              <input
                id={field.name}
                name={field.name}
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                className="form-input"
                value={form[field.name]}
                onChange={handleChange}
                required
              />
              {field.hint && (
                <span className="affordability-hint">{field.hint}</span>
              )}
            </div>
          ))}

          <div className="affordability-options">
            <div className="form-group">
              <label className="form-label" htmlFor="mortgage_term_years">
                Mortgage term
              </label>
              <select
                id="mortgage_term_years"
                name="mortgage_term_years"
                className="form-select"
                value={form.mortgage_term_years}
                onChange={handleChange}
              >
                <option value="15">15 years</option>
                <option value="20">20 years</option>
                <option value="30">30 years</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="auto_term_months">
                Car loan term
              </label>
              <select
                id="auto_term_months"
                name="auto_term_months"
                className="form-select"
                value={form.auto_term_months}
                onChange={handleChange}
              >
                <option value="36">36 months</option>
                <option value="48">48 months</option>
                <option value="60">60 months</option>
                <option value="72">72 months</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="auto_down_payment">
                Car down payment
              </label>
              <input
                id="auto_down_payment"
                name="auto_down_payment"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                className="form-input"
                value={form.auto_down_payment}
                onChange={handleChange}
              />
            </div>
          </div>

          {loggedIn && (
            <label className="affordability-save">
              <input
                type="checkbox"
                checked={saveToProfile}
                onChange={(e) => setSaveToProfile(e.target.checked)}
              />
              Save income, debts, and savings to my profile
            </label>
          )}

          {error && (
            <p className="affordability-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary affordability-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Calculating…' : 'Calculate'}
          </button>
        </form>

        {results && (
          <>
            <AffordabilityResults results={results} />
            {budget.income > 0 ? (
              <BudgetImpact
                scenarios={buildScenarios(budget, results)}
                income={budget.income}
              />
            ) : (
              <p className="card affordability-note">
                Add your income and expenses on the{' '}
                <Link to="/">home page</Link> to see how these payments would
                fit your monthly budget.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Affordability;
