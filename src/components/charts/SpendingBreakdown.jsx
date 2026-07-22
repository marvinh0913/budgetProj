import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import '../../styles/charts.css';

ChartJS.register(ArcElement, Tooltip, Legend);

function SpendingBreakdown({ data }) {
  const isEmpty = !data || Object.keys(data).length === 0;

  if (isEmpty) {
    return (
      <div className="spending-breakdown card">
        <h2 className="chart-heading">Spending Breakdown</h2>
        <p className="chart-empty">No spending data to display.</p>
      </div>
    );
  }

  const chartData = {
    labels: Object.keys(data).map((k) => k.replace(/_/g, ' ')),
    datasets: [
      {
        data: Object.values(data),
        backgroundColor: [
          '#2B9FD9',
          '#7EC8E3',
          '#4CAF50',
          '#FF9800',
          '#F44336',
          '#9C27B0',
          '#00BCD4',
          '#FF5722',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
    },
  };

  return (
    <div className="spending-breakdown card">
      <h2 className="chart-heading">Spending Breakdown</h2>
      <Doughnut data={chartData} options={options} />
    </div>
  );
}

export default SpendingBreakdown;
