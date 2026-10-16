import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import '../../styles/charts.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

function InterestImpact({ data }) {
  if (!data) {
    return (
      <div className="interest-impact card">
        <h2 className="chart-heading">Interest Impact</h2>
        <p className="chart-empty">No interest data to display.</p>
      </div>
    );
  }

  const { final_balance, total_deposited, interest_earned, monthly_rate } =
    data;

  // Generate monthly growth data points
  const months = Array.from({ length: 13 }, (_, i) => `Month ${i}`);
  const balances = months.map((_, i) => {
    if (i === 0)
      return total_deposited - (total_deposited - total_deposited / 12);
    return Math.round((total_deposited / 12) * i * (1 + monthly_rate / 100));
  });

  const chartData = {
    labels: months,
    datasets: [
      {
        label: 'Savings Growth',
        data: balances,
        borderColor: '#2B9FD9',
        backgroundColor: 'rgba(43, 159, 217, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  return (
    <div className="interest-impact card">
      <h2 className="chart-heading">Interest Impact</h2>
      <div className="interest-impact-stats">
        <div className="interest-impact-stat">
          <span className="interest-impact-label">Final Balance</span>
          <span className="interest-impact-value text-success">
            ${final_balance.toFixed(2)}
          </span>
        </div>
        <div className="interest-impact-stat">
          <span className="interest-impact-label">Interest Earned</span>
          <span className="interest-impact-value text-primary">
            ${interest_earned.toFixed(2)}
          </span>
        </div>
      </div>
      <Line data={chartData} options={options} />
    </div>
  );
}

export default InterestImpact;
