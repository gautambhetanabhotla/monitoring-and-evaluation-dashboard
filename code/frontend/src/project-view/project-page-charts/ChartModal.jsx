import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import FileUploader from './FileUploader';
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2';

const ChartModal = ({ isOpen, onClose, onSave, editingChart }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [chartType, setChartType] = useState('bar');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [categoryField, setCategoryField] = useState('');
  const [valueField, setValueField] = useState('');
  const [title, setTitle] = useState('');

  // Define chart colors for consistency across all chart types
  const chartColors = {
    backgroundColor: [
      'rgba(255, 99, 132, 0.6)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 206, 86, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(153, 102, 255, 0.6)',
      'rgba(255, 159, 64, 0.6)',
    ],
    borderColor: [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)',
    ]
  };

  useEffect(() => {
    if (editingChart) {
      setData(editingChart.data);
      // Fallback to [] if editingChart.columns is undefined
      setColumns(editingChart.columns || []);
      setChartType(editingChart.type);
      
      if (editingChart.type === 'pie') {
        setCategoryField(editingChart.categoryField || '');
        setValueField(editingChart.valueField || '');
      } else {
        setXAxis(editingChart.xAxis || '');
        setYAxis(editingChart.yAxis || '');
      }
      
      setTitle(editingChart.title);
      setStep(2);
    } else {
      resetForm();
    }
  }, [editingChart, isOpen]);
  

  const resetForm = () => {
    setData([]);
    setColumns([]);
    setChartType('bar');
    setXAxis('');
    setYAxis('');
    setCategoryField('');
    setValueField('');
    setTitle('');
    setStep(1);
  };

  const handleDataLoaded = (newData, newColumns) => {
    console.log("Loaded columns:", newColumns); // Debugging step
    if (newColumns.length === 0) {
      alert("No columns found in the uploaded file!");
      return;
    }
    
    setData(newData);
    setColumns(newColumns);
    setStep(2);
  
    // Auto-select default values if available
    if (newColumns.length >= 2) {
      if (chartType === 'pie') {
        setCategoryField(newColumns[0]);
        setValueField(newColumns[1]);
      } else {
        setXAxis(newColumns[0]);
        setYAxis(newColumns[1]);
      }
    }
  };
  
  // Update default axes when chart type changes
  useEffect(() => {
    if (columns.length >= 2) {
      if (chartType === 'pie') {
        if (!categoryField) setCategoryField(xAxis || columns[0]);
        if (!valueField) setValueField(yAxis || columns[1]);
      } else {
        if (!xAxis) setXAxis(categoryField || columns[0]);
        if (!yAxis) setYAxis(valueField || columns[1]);
      }
    }
  }, [chartType]);

  const handleSave = () => {
    const chartConfig = {
      id: editingChart?.id || Date.now().toString(),
      type: chartType,
      data,
      columns,
      title: title || `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`,
    };
    
    if (chartType === 'pie') {
      chartConfig.categoryField = categoryField;
      chartConfig.valueField = valueField;
    } else {
      chartConfig.xAxis = xAxis;
      chartConfig.yAxis = yAxis;
    }
    
    onSave(chartConfig);
    onClose();
    resetForm();
  };

  const getChartData = () => {
    if (chartType === 'pie') {
      return {
        labels: data.map((item) => item[categoryField]?.toString() || ''),
        datasets: [
          {
            data: data.map((item) => Number(item[valueField]) || 0),
            backgroundColor: chartColors.backgroundColor,
            borderColor: chartColors.borderColor,
            borderWidth: 1,
          },
        ],
      };
    } else if (chartType === 'scatter') {
      return {
        datasets: [
          {
            label: `${xAxis} vs ${yAxis}`,
            data: data.map((item) => ({
              x: Number(item[xAxis]) || 0,
              y: Number(item[yAxis]) || 0,
            })),
            backgroundColor: chartColors.backgroundColor[0],
            borderColor: chartColors.borderColor[0],
          },
        ],
      };
    } else {
      // For bar and line charts
      return {
        labels: data.map((item) => item[xAxis]?.toString() || ''),
        datasets: [
          {
            label: yAxis,
            data: data.map((item) => Number(item[yAxis]) || 0),
            backgroundColor: chartType === 'line' ? chartColors.backgroundColor[0] : chartColors.backgroundColor,
            borderColor: chartType === 'line' ? chartColors.borderColor[0] : chartColors.borderColor,
            borderWidth: 1,
          },
        ],
      };
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        display: true, // Ensure legend is always displayed, especially for pie charts
      },
      title: {
        display: true,
        text: title || `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`,
      },
      datalabels: {
        display: false,
      },
    },
  };

  const renderPreviewChart = () => {
    const chartData = getChartData();
    
    // Ensure all chart types render within the canvas
    switch (chartType) {
      case 'bar':
        return <Bar data={chartData} options={options} />;
      case 'line':
        return <Line data={chartData} options={options} />;
      case 'pie':
        return <Pie data={chartData} options={options} />;
      case 'scatter':
        return <Scatter data={chartData} options={options} />;
      default:
        return <div>Select a chart type</div>;
    }
  };

  const isPieChart = chartType === 'pie';
  const isAxisBasedChart = !isPieChart;
  
  const canPreview = isPieChart 
    ? (categoryField && valueField) 
    : (xAxis && yAxis);
    
  const canSave = isPieChart 
    ? (categoryField && valueField) 
    : (xAxis && yAxis);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">
            {editingChart ? 'Edit Visualization' : 'Add New Visualization'}
          </h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {step === 1 && (
            <div>
              <h3 className="modal-section-title">Upload Data File</h3>
              <FileUploader onDataLoaded={handleDataLoaded} />
            </div>
          )}

          {step === 2 && (
            <div className="configuration-grid">
              <div className="config-section">
                <h3 className="modal-section-title">Configure Visualization</h3>
                
                <div className="form-group">
                  <label className="form-label">
                    Chart Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter chart title"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Chart Type
                  </label>
                  <div className="form-grid">
                    {(['bar', 'line', 'pie', 'scatter']).map((type) => (
                      <button
                        key={type}
                        onClick={() => setChartType(type)}
                        className={`btn ${chartType === type ? 'btn-primary' : 'btn-secondary'}`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conditional rendering based on chart type */}
                {isAxisBasedChart ? (
                  <>
                    <div className="form-group">
                      <label className="form-label">
                        X-Axis (Category)
                      </label>
                      <select
                        value={xAxis}
                        onChange={(e) => setXAxis(e.target.value)}
                        className="form-select"
                      >
                        <option value="">Select X-Axis</option>
                        {columns.map((column) => (
                          <option key={column} value={column}>
                            {column}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Y-Axis (Value)
                      </label>
                      <select
                        value={yAxis}
                        onChange={(e) => setYAxis(e.target.value)}
                        className="form-select"
                      >
                        <option value="">Select Y-Axis</option>
                        {columns.map((column) => (
                          <option key={column} value={column}>
                            {column}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="form-label">
                        Category Field (Labels)
                      </label>
                      <select
                        value={categoryField}
                        onChange={(e) => setCategoryField(e.target.value)}
                        className="form-select"
                      >
                        <option value="">Select Category Field</option>
                        {columns.map((column) => (
                          <option key={column} value={column}>
                            {column}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Value Field (Sizes)
                      </label>
                      <select
                        value={valueField}
                        onChange={(e) => setValueField(e.target.value)}
                        className="form-select"
                      >
                        <option value="">Select Value Field</option>
                        {columns.map((column) => (
                          <option key={column} value={column}>
                            {column}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div className="form-buttons">
                  <button
                    onClick={() => setStep(1)}
                    className="btn btn-secondary"
                  >
                    Back to Upload
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!canSave}
                    className="btn btn-primary"
                  >
                    Save Visualization
                  </button>
                </div>
              </div>

              <div className="preview-section">
                <h3 className="modal-section-title">Preview</h3>
                <div className="chart-preview-container">
                  {canPreview ? (
                    renderPreviewChart()
                  ) : (
                    <div className="empty-preview">
                      {isPieChart ? 
                        'Select category and value fields to preview chart' : 
                        'Select axes to preview chart'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartModal;