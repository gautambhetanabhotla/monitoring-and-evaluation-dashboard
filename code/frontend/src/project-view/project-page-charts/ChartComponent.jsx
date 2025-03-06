import React from 'react';
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2';
import { Edit2, Trash2 } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ChartComponent = ({ chart, onEdit, onRemove }) => {
  const { type, data, xAxis, yAxis, categoryField, valueField, title } = chart;

  // Generate appropriate chart data based on chart type
  let chartData;
  
  if (type === 'pie') {
    // Use categoryField and valueField for pie charts
    chartData = {
      labels: data.map((item) => item[categoryField]?.toString() || ''),
      datasets: [
        {
          label: valueField || 'Value',
          data: data.map((item) => {
            const value = Number(item[valueField]);
            return isNaN(value) ? 0 : value;
          }),
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  } else if (type === 'scatter') {
    chartData = {
      datasets: [
        {
          label: `${xAxis} vs ${yAxis}`,
          data: data.map((item) => ({
            x: Number(item[xAxis]) || 0,
            y: Number(item[yAxis]) || 0,
          })),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
        },
      ],
    };
  } else {
    // For bar and line charts
    chartData = {
      labels: data.map((item) => item[xAxis]?.toString() || ''),
      datasets: [
        {
          label: yAxis,
          data: data.map((item) => Number(item[yAxis]) || 0),
          backgroundColor: type === 'line' 
            ? 'rgba(54, 162, 235, 0.6)' 
            : [
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 99, 132, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)',
              ],
          borderColor: type === 'line'
            ? 'rgba(54, 162, 235, 1)'
            : [
                'rgba(54, 162, 235, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
              ],
          borderWidth: 1,
        },
      ],
    };
  }

  // Create options with specific settings for pie charts
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: type === 'pie' ? 'right' : 'top',
        display: true,
      },
      title: {
        display: true,
        text: title,
      },
    },
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar data={chartData} options={options} />;
      case 'line':
        return <Line data={chartData} options={options} />;
      case 'pie':
        return <Pie data={chartData} options={options} />;
      case 'scatter':
        return <Scatter data={chartData} options={options} />;
      default:
        return <div className="unsupported-chart-type">Unsupported chart type</div>;
    }
  };

  return (
    <div className="chart-relative">
      <button
        onClick={onRemove}
        className="remove-button"
        title="Remove visualization"
      >
        <Trash2 size={16} className="remove-icon" color='red'/>
      </button>
      <button
        onClick={onEdit}
        className="edit-button"
        title="Edit visualization"
      >
        <Edit2 size={16} className="edit-icon" />
      </button>
      <div className="chart-container">{renderChart()}</div>
    </div>
  );
};

export default ChartComponent;