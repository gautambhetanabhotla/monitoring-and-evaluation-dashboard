import React, { useState, useEffect } from 'react';
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
// Import and register the datalabels plugin
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const ChartComponent = ({ chart, onEdit, onRemove }) => {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/user/getUser`, { credentials: 'include' });
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };
    fetchUserDetails();
  }, []);

  if(!chart) return null;
  const { type, data, xAxis, yAxis, categoryField, valueField, title } = chart;

  // Generate chart data based on type
  let chartData;
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="chart-relative">
        { user?.role === 'admin' &&
          <button onClick={onRemove} className="remove-button" title="Remove visualization">
            <Trash2 size={16} className="remove-icon" color='red'/>
          </button>
        }
        { user?.role === 'admin' &&
          <button onClick={onEdit} className="edit-button" title="Edit visualization">
            <Edit2 size={16} className="edit-icon" />
          </button>
        } 
        <div className="chart-container">
          <div className="no-data-message">No data available for this chart</div>
        </div>
      </div>
    );
  }
  
  if (type === 'pie') {
    // For pie charts, map valid labels and values
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

  // Define options with datalabels for pie charts
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
      },
    },
    plugins: {
      legend: {
        position: type === 'pie' ? 'right' : 'top',
        display: true,
      },
      title: {
        display: true,
        text: title,
      },
      datalabels: type === 'pie'
        ? {
            formatter: (value, context) => {
              const dataArr = context.chart.data.datasets[0].data;
              const total = dataArr.reduce((sum, val) => sum + val, 0);
              const percentage = (value / total) * 100;
              const formattedPercentage = percentage.toFixed(1) + '%';
              return percentage < 5 ? '↘ ' + formattedPercentage : formattedPercentage;
            },
            color: '#fff',
            align: (context) => {
              const dataArr = context.chart.data.datasets[0].data;
              const total = dataArr.reduce((sum, val) => sum + val, 0);
              const percentage = (context.dataset.data[context.dataIndex] / total) * 100;
              return percentage < 5 ? 'end' : 'center';
            },
            anchor: (context) => {
              const dataArr = context.chart.data.datasets[0].data;
              const total = dataArr.reduce((sum, val) => sum + val, 0);
              const percentage = (context.dataset.data[context.dataIndex] / total) * 100;
              return percentage < 5 ? 'end' : 'center';
            },
            offset: (context) => {
              const dataArr = context.chart.data.datasets[0].data;
              const total = dataArr.reduce((sum, val) => sum + val, 0);
              const percentage = (context.dataset.data[context.dataIndex] / total) * 100;
              return percentage < 5 ? 10 : 0;
            },
          }
        : { display: false },
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
      { user?.role === 'admin' &&
        <button
          onClick={onRemove}
          className="remove-button"
          title="Remove visualization"
        >
          <Trash2 size={16} className="remove-icon" color='red'/>
        </button>
      }
      { user?.role === 'admin' && 
        <button
          onClick={onEdit}
          className="edit-button"
          title="Edit visualization"
        >
          <Edit2 size={16} className="edit-icon" />
        </button>
      }
      <div className="chart-container">{renderChart()}</div>
    </div>
  );
};

export default ChartComponent;
