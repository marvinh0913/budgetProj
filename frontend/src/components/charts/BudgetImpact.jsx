import { useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { currency } from '../../utils/format';
import '../../styles/charts.css';

ChartJS.register(ArcElement, Tooltip, Legend);

// Every pair of these colors was checked to stay distinguishable, including
// for colorblind users, since any two slices can end up next to each other.
// "Left over" is a neutral gray, since it's not spending.
const SEGMENTS = [
  { key: 'essentials', label: 'Essentials', color: '#2b9fd9' },
  { key: 'wants', label: 'Wants & other', color: '#eda100' },
  { key: 'savings', label: 'Savings', color: '#1baf7a' },
  { key: 'newPayment', label: 'New loan payment', color: '#7b61d1' },
  { key: 'leftOver', label: 'Left over', color: '#c9d5dc' },
];

function BudgetImpact({ scenarios, income }) {
  const [selected, setSelected] = useState(0);

  // A new calculation can return fewer scenarios; stay within range
  const index = Math.min(selected, scenarios.length - 1);
  const scenario = scenarios[index];

  // Only draw slices that exist in this scenario. Each keeps its own color,
  // so a category looks the same no matter which scenario is shown.
  const slices = SEGMENTS.filter((segment) => scenario[segment.key] > 0);

  const chartData = {
    labels: slices.map((s) => s.label),
    datasets: [
      {
        data: slices.map((s) => scenario[s.key]),
        backgroundColor: slices.map((s) => s.color),
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const share = Math.round((ctx.parsed / income) * 100);
            return `${ctx.label}: ${currency.format(ctx.parsed)} (${share}% of income)`;
          },
        },
      },
    },
  };

  return (
    <div className="budget-impact card">
      <h2 className="chart-heading">How it fits your monthly budget</h2>
      <p className="budget-impact-intro">
        Uses the {currency.format(income)} monthly income from your home page
        budget. Your gross income above only sets the loan limits. The home
        scenario replaces your current rent or mortgage.
      </p>

      <div
        className="budget-impact-switcher"
        role="group"
        aria-label="Choose a scenario"
      >
        {scenarios.map((s, i) => (
          <button
            key={s.label}
            type="button"
            className={`budget-impact-tab${i === index ? ' is-active' : ''}`}
            aria-pressed={i === index}
            onClick={() => setSelected(i)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <p className="budget-impact-summary">
        {scenario.leftOver >= 0 ? (
          <>
            Left over each month:{' '}
            <strong>{currency.format(scenario.leftOver)}</strong>
          </>
        ) : (
          <span className="budget-impact-short">
            <ExclamationTriangleIcon
              className="budget-impact-icon"
              aria-hidden="true"
            />
            Short by {currency.format(-scenario.leftOver)} each month
          </span>
        )}
      </p>

      <div className="budget-impact-chart">
        <Doughnut
          data={chartData}
          options={options}
          role="img"
          aria-label={`Monthly budget breakdown: ${scenario.label}`}
        />
      </div>

      <table className="budget-impact-table">
        <thead>
          <tr>
            <th scope="col">Scenario</th>
            <th scope="col">New payment</th>
            <th scope="col">Total spending</th>
            <th scope="col">Left over</th>
          </tr>
        </thead>
        <tbody>
          {scenarios.map((s, i) => (
            <tr key={s.label} className={i === index ? 'is-selected' : ''}>
              <th scope="row">{s.label}</th>
              <td>{s.newPayment ? currency.format(s.newPayment) : '—'}</td>
              <td>{currency.format(s.spending)}</td>
              <td>
                {s.leftOver >= 0 ? (
                  currency.format(s.leftOver)
                ) : (
                  <span className="budget-impact-short">
                    <ExclamationTriangleIcon
                      className="budget-impact-icon"
                      aria-hidden="true"
                    />
                    Short by {currency.format(-s.leftOver)}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BudgetImpact;
