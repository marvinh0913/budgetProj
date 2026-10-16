import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import '../../styles/charts.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BUDGET_TARGETS = {
  essentials: 50,
  wants: 30,
  savings: 20,
};

function BudgetVsActual({ data, income }) {
  const isEmpty = !data || Object.keys(data).length === 0 || income === 0;

  if (isEmpty) {
    return (
      <div className="budget-vs-actual card">
        <h2 className="chart-heading">Budget vs Actual</h2>
        <p className="chart-empty">No budget data to display.</p>
      </div>
    );
  }

  const groups = ['essentials', 'wants', 'savings'];

  const actualPercentages = groups.map((g) =>
    income > 0 ? Math.round((data[g] / income) * 100) : 0
  );

  const recommendedPercentages = groups.map((g) => BUDGET_TARGETS[g]);

  const chartData = {
    labels: groups,
    datasets: [
      {
        label: 'Actual %',
        data: actualPercentages,
        backgroundColor: '#2B9FD9',
      },
      {
        label: 'Recommended %',
        data: recommendedPercentages,
        backgroundColor: '#7EC8E3',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return (
    <div className="budget-vs-actual card">
      <h2 className="chart-heading">Budget vs Actual</h2>
      <Bar data={chartData} options={options} />
    </div>
  );
}

export default BudgetVsActual;
