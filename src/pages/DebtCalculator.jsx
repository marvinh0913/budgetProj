import { useState } from 'react';
import '../styles/debtcalculator.css';

const TABS = ['mortgage', 'credit card', 'auto loan', 'savings'];
const AUTO_LOAN_TERMS = [24, 36, 48, 60, 72, 84];

function DebtCalculator({ rates, transactions, onCalculate }) {
  const [activeTab, setActiveTab] = useState('mortgage');

  // Mortgage state
  const [loanAmount, setLoanAmount] = useState('');
  const [mortgageTerm, setMortgageTerm] = useState(30);

  // Credit card state
  const [balance, setBalance] = useState('');

  // Auto loan state
  const [principal, setPrincipal] = useState('');
  const [termMonths, setTermMonths] = useState(60);

  // Savings state
  const [initialAmount, setInitialAmount] = useState('');
  const [monthlyDeposit, setMonthlyDeposit] = useState('');
  const [months, setMonths] = useState('');

  const handleCalculate = () => {
    if (activeTab === 'mortgage') {
      onCalculate('mortgage', {
        loan_amount: parseFloat(loanAmount),
        rate: rates.mortgage,
        term_years: mortgageTerm,
      });
    } else if (activeTab === 'credit card') {
      onCalculate('credit_card', {
        balance: parseFloat(balance),
        rate: rates.credit_card,
      });
    } else if (activeTab === 'auto loan') {
      onCalculate('auto_loan', {
        principal: parseFloat(principal),
        rate: rates.auto_loan,
        term_months: termMonths,
      });
    } else if (activeTab === 'savings') {
      onCalculate('savings', {
        principal: parseFloat(initialAmount),
        monthly_deposit: parseFloat(monthlyDeposit),
        rate: rates.federal_funds,
        months: parseFloat(months),
      });
    }
  };

  return (
    <div className="debt-calculator card">
      <h2 className="debt-calculator-heading">Debt & Interest Calculator</h2>

      {/* Rate status bar */}
      <div className="debt-calculator-rates">
        <span>Mortgage: {rates.mortgage}%</span>
        <span>Federal Funds: {rates.federal_funds}%</span>
        <span>Credit Card: {rates.credit_card}%</span>
        <span>Auto Loan: {rates.auto_loan}%</span>
      </div>

      {/* Tab selector */}
      <div className="debt-calculator-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`debt-calculator-tab btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Mortgage tab */}
      {activeTab === 'mortgage' && (
        <div className="debt-calculator-form">
          <div className="form-group">
            <label className="form-label" htmlFor="loan-amount">
              Loan Amount
            </label>
            <input
              id="loan-amount"
              type="number"
              className="form-input"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              placeholder="300000"
              min="0"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="mortgage-term">
              Term
            </label>
            <select
              id="mortgage-term"
              className="form-select"
              value={mortgageTerm}
              onChange={(e) => setMortgageTerm(Number(e.target.value))}
            >
              <option value={15}>15 years</option>
              <option value={30}>30 years</option>
            </select>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleCalculate}
            aria-label="calculate"
          >
            Calculate
          </button>
        </div>
      )}

      {/* Credit card tab */}
      {activeTab === 'credit card' && (
        <div className="debt-calculator-form">
          <div className="form-group">
            <label className="form-label" htmlFor="balance">
              Balance
            </label>
            <input
              id="balance"
              type="number"
              className="form-input"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="5000"
              min="0"
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleCalculate}
            aria-label="calculate"
          >
            Calculate
          </button>
        </div>
      )}

      {/* Auto loan tab */}
      {activeTab === 'auto loan' && (
        <div className="debt-calculator-form">
          <div className="form-group">
            <label className="form-label" htmlFor="principal">
              Principal
            </label>
            <input
              id="principal"
              type="number"
              className="form-input"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              placeholder="25000"
              min="0"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="term-months">
              Term
            </label>
            <select
              id="term-months"
              className="form-select"
              value={termMonths}
              onChange={(e) => setTermMonths(Number(e.target.value))}
            >
              {AUTO_LOAN_TERMS.map((term) => (
                <option key={term} value={term}>
                  {term} months
                </option>
              ))}
            </select>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleCalculate}
            aria-label="calculate"
          >
            Calculate
          </button>
        </div>
      )}

      {/* Savings tab */}
      {activeTab === 'savings' && (
        <div className="debt-calculator-form">
          <div className="form-group">
            <label className="form-label" htmlFor="initial-amount">
              Initial Amount
            </label>
            <input
              id="initial-amount"
              type="number"
              className="form-input"
              value={initialAmount}
              onChange={(e) => setInitialAmount(e.target.value)}
              placeholder="1000"
              min="0"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="monthly-deposit">
              Monthly Deposit
            </label>
            <input
              id="monthly-deposit"
              type="number"
              className="form-input"
              value={monthlyDeposit}
              onChange={(e) => setMonthlyDeposit(e.target.value)}
              placeholder="200"
              min="0"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="months">
              Months
            </label>
            <input
              id="months"
              type="number"
              className="form-input"
              value={months}
              onChange={(e) => setMonths(e.target.value)}
              placeholder="12"
              min="0"
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleCalculate}
            aria-label="calculate"
          >
            Calculate
          </button>
        </div>
      )}
    </div>
  );
}

export default DebtCalculator;