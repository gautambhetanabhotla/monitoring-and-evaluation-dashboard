import React, { useState, useEffect, useRef } from 'react';
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
  const chartRef = useRef(null);
  const [hiddenSegments, setHiddenSegments] = useState({});

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`/api/user/getUser`, { credentials: 'include' });
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

  if (!chart) return null;
  const { type, data, xAxis, yAxis, categoryField, valueField, title } = chart;

  let chartData;
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="chart-relative">
        {user?.role === 'admin' && (
          <>
            <button onClick={onRemove} className="remove-button" title="Remove visualization">
              <Trash2 size={16} className="remove-icon" color="red" />
            </button>
            <button onClick={onEdit} className="edit-button" title="Edit visualization">
              <Edit2 size={16} className="edit-icon" />
            </button>
          </>
        )}
        <div className="chart-container">
          <div className="no-data-message">No data available for this chart</div>
        </div>
      </div>
    );
  }

  if (type === 'pie') {
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
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
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
          backgroundColor: 'rgba(54, 162, 235, 1)',
        },
      ],
    };
  } else {
    chartData = {
      labels: data.map((item) => item[xAxis]?.toString() || ''),
      datasets: [
        {
          label: yAxis,
          data: data.map((item) => Number(item[yAxis]) || 0),
          backgroundColor:
            type === 'line'
              ? 'rgba(54, 162, 235, 1)'
              : [
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 99, 132, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)',
                ],
          borderColor:
            type === 'line'
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
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 10,
        right: type === 'pie' ? 10 : 0,
        bottom: 10,
        left: 10,
      },
    },
    plugins: {
      legend: {
        display: type === 'pie' ? false : true,
        position: type === 'pie' ? 'right' : 'top',
      },
      title: {
        display: true,
        text: title,
      },
      tooltip:
        type === 'pie'
          ? {
              callbacks: {
                label: (tooltipItem) => {
                  const dataset = tooltipItem.chart.data.datasets[tooltipItem.datasetIndex];
                  const currentValue = dataset.data[tooltipItem.dataIndex];
                  const total = dataset.data.reduce((sum, val) => sum + val, 0);
                  const percentage = ((currentValue / total) * 100).toFixed(1);
                  return `${tooltipItem.label}: ${currentValue} (${percentage}%)`;
                },
              },
            }
          : undefined,
      datalabels:
        type === 'pie'
          ? {
              formatter: (value, context) => {
                const dataArr = context.chart.data.datasets[0].data;
                const total = dataArr.reduce((sum, val) => sum + val, 0);
                const percentage = (value / total) * 100;
                return percentage > 7.5 ? percentage.toFixed(1) + '%' : '';
              },
              color: '#000',
              align: 'center',
              anchor: 'center',
            }
          : { display: false },
    },
    ...(type !== 'pie' && {
      scales: {
        x: {
          ticks: {
            color: '#ffffff',
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
        },
        y: {
          ticks: {
            color: '#ffffff',
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
        },
      },
    }),
  };
  const handleLegendClick = (index) => {
    if (chartRef.current) {
      chartRef.current.toggleDataVisibility(index);
      chartRef.current.update();
      setHiddenSegments((prev) => ({ ...prev, [index]: !prev[index] }));
    }
  };

  const renderCustomLegend = () => {
    if (type !== 'pie') return null;
    const dataset = chartData.datasets[0];
    return (
      <div
        className="custom-legend"
        style={{
          maxHeight: '300px',
          overflowY: 'auto',
          padding: '2px',
          marginLeft: '20px',
          marginTop: '40px',
          marginBottom: '25px',
          marginRight: '20px',
        }}
      >
        {chartData.labels.map((label, index) => {
          const bgColor = dataset.backgroundColor[index % dataset.backgroundColor.length];
          const isHidden = hiddenSegments[index];
          return (
            <div
              key={index}
              onClick={() => handleLegendClick(index)}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '4px',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: bgColor,
                  marginRight: '8px',
                }}
              ></div>
              <span style={{ color: 'black', textDecoration: isHidden ? 'line-through' : 'none' }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar data={chartData} options={options} />;
      case 'line':
        return <Line data={chartData} options={options} />;
      case 'pie':
        return <Pie ref={chartRef} data={chartData} options={options} />;
      case 'scatter':
        return <Scatter data={chartData} options={options} />;
      default:
        return <div className="unsupported-chart-type">Unsupported chart type</div>;
    }
  };

  return (
    <div className="chart-relative">
      {user?.role === 'admin' && (
        <>
          <button onClick={onRemove} className="remove-button" title="Remove visualization">
            <Trash2 size={16} className="remove-icon" color="red" />
          </button>
          <button onClick={onEdit} className="edit-button" title="Edit visualization">
            <Edit2 size={16} className="edit-icon" />
          </button>
        </>
      )}
      {type === 'pie' ? (
        <div style={{ display: 'flex', marginTop: '20px', gap: '20px' }}>
          <div className="chart-container" style={{ flex: 1 }}>
            {renderChart()}
          </div>
          {renderCustomLegend()}
        </div>
      ) : (
        <div className="chart-container" style={{ marginTop: '20px' }}>
          {renderChart()}
        </div>
      )}
    </div>
  );
};

export default ChartComponent;
