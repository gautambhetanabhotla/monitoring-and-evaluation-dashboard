import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { X } from 'lucide-react';
import FileUploader from './FileUploader';
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2';
import KpiList from './KpiList';

const ChartModal = ({ isOpen, onClose, onSave, editingChart }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [chartType, setChartType] = useState('bar');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState(['']);
  const [categoryField, setCategoryField] = useState('');
  const [valueField, setValueField] = useState(['']);
  const [title, setTitle] = useState('');
  const [selectedKpi, setSelectedKpi] = useState(null);
  const default_color_set=['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#6366f1', '#f472b6', '#8b5cf6', '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#6366f1', '#f472b6', '#8b5cf6'];
  const [selectedColor, setSelectedColor] = useState(default_color_set);
  const [category, setCategory] = useState('');
  const [kpiError, setKpiError] = useState('');
  const [Mode_bar_line, setMode] = useState('normal');
  const [numComparisons, setNumComparisons] = useState(1);
  const { projectid } = useParams();

  const chartColors = {
    backgroundColor: [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)',
    ],
    borderColor: [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)',
    ],
  };

  useEffect(() => {
    if (editingChart) {
      setData(editingChart.data);
      setColumns(editingChart.columns || []);
      setChartType(editingChart.type);
      if (editingChart.type === 'pie' || editingChart.type === 'donut') {
        setCategoryField(editingChart.categoryField || '');
        setValueField(editingChart.valueField || '');
      } else {
        setXAxis(editingChart.xAxis || '');
        setYAxis(editingChart.yAxis || '');
        setSelectedColor(editingChart.colors?.map((color) => color.backgroundColor) || default_color_set);
      }
      setTitle(editingChart.title);
      setSelectedKpi({ _id: editingChart.kpi_id });
      setCategory(editingChart.category || '');
      setMode(editingChart.Mode || 'normal');
      setNumComparisons(editingChart.yAxis.length || 1);
      setStep(2);
    } else {
      resetForm();
      setStep(0);
    }
  }, [editingChart, isOpen]);

  const resetForm = () => {
    setData([]);
    setColumns([]);
    setChartType('bar');
    setXAxis('');
    setYAxis(['']);
    setCategoryField('');
    setValueField(['']);
    setTitle('');
    setSelectedKpi(null);
    setMode('normal');
    setNumComparisons(1);
    setSelectedColor(default_color_set);
    setCategory('');
    setKpiError('');
  };

  const handleDataLoaded = (newData, newColumns) => {
    if (newColumns.length === 0) {
      alert('No columns found in the uploaded file!');
      return;
    }
    setData(newData);
    setColumns(newColumns);
    setStep(2);
    if (newColumns.length >= 2) {
        setCategoryField(newColumns[0]);
        setValueField([newColumns[1]]);
        setXAxis(newColumns[0]);
        setYAxis([newColumns[1]]);
    }
  };

  useEffect(() => {
    if (columns.length >= 2) {
      if (!categoryField) setCategoryField(xAxis || columns[0]);
      if (!valueField) setValueField(yAxis || [columns[1]]);
      if (!xAxis) setXAxis(categoryField || columns[0]);
      if (!yAxis) setYAxis(valueField || [columns[1]]);
    }
  }, [columns]);

  const handleKpiSelect = (kpi) => {
    setSelectedKpi(kpi);
    setKpiError('');
  };

  const handleKpiNext = async () => {
    if (selectedKpi && selectedKpi._id) {
      try {
        const response = await fetch(`/api/visualisation/get-kpi-updates-as-data/${selectedKpi._id}`, { credentials: 'include' });
        const resData = await response.json();
        if (resData.success) {
          setData(resData.data);
          setColumns(["DateTime", "Value"]);
          setKpiError('');
          setTitle(selectedKpi.indicator);
          setStep(2);
        } else {
          setKpiError(resData.message || 'Error fetching KPI data');
        }
      } catch (error) {
        console.error(error);
        setKpiError('Error fetching KPI data');
      }
    }
  };

  const handleSave = () => {
    const chartConfig = {
      id: editingChart?.id || Date.now().toString(),
      type: chartType,
      data,
      columns,
      title: title || `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`,
      category,
      kpi_id: selectedKpi ? selectedKpi._id : null,
    };

    if (chartType === 'pie' || chartType === 'donut') {
      chartConfig.categoryField = categoryField;
      chartConfig.valueField = valueField;
    } else {
      chartConfig.xAxis = xAxis;
      chartConfig.yAxis = yAxis;
      chartConfig.colors = selectedColor.map((color) => ({
        backgroundColor: color,
        borderColor: color,
      }));
    }
    chartConfig.Mode = Mode_bar_line;
    onSave(chartConfig);
    onClose();
    resetForm();
  };

  const getChartData = () => {
    if (chartType === 'pie' || chartType === 'donut') {
      return {
        labels: data.map((item) => item[categoryField]?.toString() || ''),
        datasets: [
          {
            data: data.map((item) => Number(item[valueField[0]]) || 0),
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
            label: `${xAxis} vs ${yAxis[0]}`,
            data: data.map((item) => ({
              x: Number(item[xAxis]) || 0,
              y: Number(item[yAxis[0]]) || 0,
            })),
            backgroundColor: selectedColor[0],
            borderColor: selectedColor[0],
          },
        ],
      };
    } else {
      return {
        labels: data.map((item) => item[xAxis]?.toString() || ''),
        datasets: yAxis.map((yKey, idx) => ({
          label: yKey,
          data: data.map((item) => Number(item[yKey]) || 0),
          backgroundColor: selectedColor[idx] || '#3b82f6',
          borderColor: selectedColor[idx] || '#3b82f6',
          borderWidth: 1,
          ...(chartType === 'line' ? { fill: false, tension: 0.1 } : {}),
          ...(Mode_bar_line === 'stacked' && chartType === 'bar' ? { stack: 'stack1' } : {}),
        })),
      };      
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        display: true,
      },
      title: {
        display: true,
        text: title || `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`,
      },
      datalabels: {
        display: false,
      },
    },
    ...((chartType !== 'pie' && chartType !== 'donut') && {
      scales: {
        x: {
          stacked: Mode_bar_line === 'stacked',
          ticks: {
            color: '#000000',
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
        },
        y: {
          stacked: Mode_bar_line === 'stacked',
          ticks: {
            color: '#000000',
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
        },
      },      
    }),
    ...(chartType === 'donut' && {
      cutout: '50%',
    }),
  };

  const renderPreviewChart = () => {
    const chartData = getChartData();
    switch (chartType) {
      case 'bar':
        return <Bar data={chartData} options={options} />;
      case 'line':
        return <Line data={chartData} options={options} />;
      case 'pie':
        return <Pie key="pie" data={chartData} options={options} />;
      case 'donut':
        return <Pie key="donut" data={chartData} options={options} />;
      case 'scatter':
        return <Scatter data={chartData} options={options} />;
      default:
        return <div>Select a chart type</div>;
    }
  };

  const isPieChart = chartType === 'pie' || chartType === 'donut';
  const isAxisBasedChart = !isPieChart;
  const canPreview = isPieChart ? (categoryField && valueField) : (xAxis && yAxis);
  const canSave = (() => {
    if (chartType === 'pie' || chartType === 'donut') {
      return categoryField && valueField[0];
    }
  
    if (!xAxis || yAxis.length === 0) return false;
  
    const allYAxisFilled = yAxis.every((y) => y && y !== '');
    return allYAxisFilled;
  })();
  

  if (!isOpen) return null;

  return (
    <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="modal-container bg-white rounded-lg shadow-lg w-full max-w-3xl mx-4">
        <div className="modal-header flex justify-between items-center p-4 border-b">
          <h2 className="modal-title text-xl font-semibold">
            {editingChart ? 'Edit Visualization' : 'Add New Visualization'}
          </h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body p-4">
          {/* Step 0: Data source selection */}
          {step === 0 && (
            <div className="data-source-selection text-center">
              <h3 className="modal-section-title text-lg font-medium">Select Data Source</h3>
              <div className="data-source-buttons flex flex-col items-center gap-4 mt-5">
                <button
                  className="btn btn-primary px-4 py-2 rounded"
                  onClick={() => {
                    setCategory("file");
                    setStep(1);
                  }}
                >
                  Add from File
                </button>
                <button
                  className="btn btn-primary px-4 py-2 rounded"
                  onClick={() => {
                    setCategory("KPI");
                    setStep(3);
                  }}
                >
                  Add from KPI
                </button>
              </div>
            </div>
          )}

          {/* Step 1: File upload flow */}
          {step === 1 && (
            <div>
              <h3 className="modal-section-title text-lg font-medium">Upload Data File</h3>
              <FileUploader onDataLoaded={handleDataLoaded} />
              <button className="btn btn-secondary mt-5 px-4 py-2 rounded" onClick={() => setStep(0)}>
                Back
              </button>
            </div>
          )}

          {/* Step 3: KPI selection flow */}
          {step === 3 && (
            <div>
              <KpiList
                projectId={projectid}
                onSelectKpi={handleKpiSelect}
                selectedKpiId={selectedKpi ? selectedKpi._id : null}
              />
              {kpiError && (
                <p className="mt-3 text-red-500 text-center">{kpiError}</p>
              )}
              <div className="flex gap-4 mt-5 justify-start">
                <button className="btn btn-secondary px-4 py-2 rounded" onClick={() => setStep(0)}>
                  Back
                </button>
                <button
                  className="btn btn-primary px-4 py-2 rounded"
                  onClick={handleKpiNext}
                  disabled={!selectedKpi || kpiError !== ''}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Final configuration */}
          {step === 2 && (
            <div className="configuration-grid grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="config-section">
                <h3 className="modal-section-title text-lg font-medium mb-4">
                  Configure Visualization
                </h3>
                <div className="form-group mb-4">
                  <label className="form-label block mb-1">Chart Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter chart title"
                    className="form-input w-full border rounded px-3 py-2"
                  />
                </div>

                <div className="form-group mb-4">
                  <label className="form-label block mb-1">Chart Type</label>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {['bar', 'line', 'pie', 'donut','scatter'].map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          if (type === 'line' && chartType === 'bar' && (Mode_bar_line === 'stacked' || Mode_bar_line === 'grouped')) {
                            setMode('multi');
                          }
                          if (type === 'bar' && chartType === 'line' && Mode_bar_line === 'multi') {
                            setMode('stacked');
                          }
                          setChartType(type);
                        }}
                        
                        className={`btn w-full px-3 py-2 rounded ${
                          chartType === type ? 'btn-primary' : 'btn-secondary'
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                    {chartType === 'bar' && (
                      <div className="form-group mb-4">
                        <label className="form-label block mb-1">Bar Chart Mode</label>
                        <div className="flex flex-row gap-2">
                          {['normal', 'stacked', 'grouped'].map((mode) => (
                            <button
                              key={mode}
                              onClick={() => {
                                setMode(mode);
                                // Reset number of comparisons when switching back to normal
                                if (mode === 'normal') {
                                  setNumComparisons(1);
                                  setYAxis(['']);
                                  setSelectedColor(default_color_set);
                                }
                                else {
                                  setNumComparisons(2);
                                  setYAxis(['', '']);
                                  setSelectedColor(default_color_set);
                                }
                              }}
                              className={`btn px-3 py-2 rounded ${
                                Mode_bar_line === mode ? 'btn-primary' : 'btn-secondary'
                              }`}
                            >
                              {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {chartType === 'line' && (
                      <div className="form-group mb-4">
                        <label className="form-label block mb-1">Line Chart Mode</label>
                        <div className="flex flex-row gap-2">
                          {['normal', 'multi'].map((mode) => (
                            <button
                              key={mode}
                              onClick={() => {
                                setMode(mode);
                                // Reset number of comparisons when switching back to normal
                                if (mode === 'normal') {
                                  setNumComparisons(1);
                                  setYAxis(['']);
                                  setSelectedColor([default_color_set[0]]);
                                }
                                else {
                                  setNumComparisons(2);
                                  setYAxis(['', '']);
                                  setSelectedColor(default_color_set);
                                }
                              }}
                              className={`btn px-3 py-2 rounded ${
                                Mode_bar_line === mode ? 'btn-primary' : 'btn-secondary'
                              }`}
                            >
                              {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                {isAxisBasedChart ? (
                  <>
                    <div className="form-group mb-4">
                      <label className="form-label block mb-1">X-Axis (Category)</label>
                      <select
                        value={xAxis}
                        onChange={(e) => setXAxis(e.target.value)}
                        className="form-select w-full border rounded px-3 py-2"
                      >
                        <option value="">Select X-Axis</option>
                        {columns.map((column) => (
                          <option key={column} value={column}>
                            {column}
                          </option>
                        ))}
                      </select>
                    </div>

                    {((Mode_bar_line === 'stacked' || Mode_bar_line === 'grouped') && chartType === 'bar') || (chartType === 'line' && Mode_bar_line === 'multi') ? (
                      <>
                        <div className="form-group mb-4">
                          <label className="form-label block mb-1">Number of components to compare</label>
                          <input
                            type="number"
                            min={2}
                            value={numComparisons}
                            onChange={(e) => {
                              const value = Number(e.target.value);
                              if (!isNaN(value)) {
                                setNumComparisons(value);
                                setYAxis(Array(value).fill(''));
                                setSelectedColor(default_color_set.slice(0, value));
                              }
                            }}
                            className="form-input w-full border rounded px-3 py-2"
                          />
                        </div>

                        {yAxis.map((_, index) => (
                          <div key={index} className="form-group mb-4 flex items-center space-x-4">
                            <div className="flex-1">
                              <label className="form-label block mb-1">Y-Axis {index + 1}</label>
                              <select
                                value={yAxis[index]}
                                onChange={(e) => {
                                  const updated = [...yAxis];
                                  updated[index] = e.target.value;
                                  setYAxis(updated);
                                }}
                                className="form-select w-full border rounded px-3 py-2"
                              >
                                <option value="">Select Y-Axis</option>
                                {columns.map((col) => (
                                  <option key={col} value={col}>{col}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex flex-col items-start">
                              <label className="form-label block mb-1">Color</label>
                              <input
                                type="color"
                                value={selectedColor[index]}
                                onChange={(e) => {
                                  const newColors = [...selectedColor];
                                  newColors[index] = e.target.value;
                                  setSelectedColor(newColors);
                                }}
                                style={{
                                  appearance: 'none',
                                  backgroundColor: 'transparent',
                                  width: '32px',
                                  height: '32px',
                                  padding: '0',
                                  border: 'none',
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </>
                    ) : 
                    (
                      <div className="form-group mb-4 flex items-center space-x-4">
                        <div className="flex-1">
                          <label className="form-label block mb-1">Y-Axis (Value)</label>
                          <select
                            value={yAxis[0]}
                            onChange={(e) => setYAxis([e.target.value])}
                            className="form-select w-full border rounded px-3 py-2"
                          >
                            <option value="">Select Y-Axis</option>
                            {columns.map((column) => (
                              <option key={column} value={column}>
                                {column}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex flex-col items-start">
                          <label className="form-label block mb-1">Color</label>
                          <input
                            type="color"
                            value={selectedColor[0]}
                            onChange={(e) => setSelectedColor([e.target.value, ...selectedColor.slice(1)])}
                            style={{
                              appearance: 'none',
                              backgroundColor: 'transparent',
                              width: '32px',
                              height: '32px',
                              padding: '0',
                              border: 'none',
                            }}
                          />
                        </div>
                      </div>
                    )}

                  </>
                ) : (
                  <>
                    <div className="form-group mb-4">
                      <label className="form-label block mb-1">Category Field (Labels)</label>
                      <select
                        value={categoryField}
                        onChange={(e) => setCategoryField(e.target.value)}
                        className="form-select w-full border rounded px-3 py-2"
                      >
                        <option value="">Select Category Field</option>
                        {columns.map((column) => (
                          <option key={column} value={column}>
                            {column}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group mb-4">
                      <label className="form-label block mb-1">Value Field (Sizes)</label>
                      <select
                        value={valueField[0]}
                        onChange={(e) => setValueField([e.target.value])}
                        className="form-select w-full border rounded px-3 py-2"
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

                <div className="form-buttons flex gap-4">
                  <button className="btn btn-secondary px-4 py-2 rounded" onClick={() => { setStep(0); resetForm(); }}>
                    Back to Upload
                  </button>
                  <button onClick={handleSave} disabled={!canSave} className="btn btn-primary px-4 py-2 rounded">
                    Save Visualization
                  </button>
                </div>
              </div>

              <div className="preview-section">
                <h3 className="modal-section-title text-lg font-medium mb-4">Preview</h3>
                <div className="chart-preview-container border rounded p-3 min-h-[300px]">
                  {canPreview ? (
                    renderPreviewChart()
                  ) : (
                    <div className="empty-preview text-center text-gray-500">
                      {isPieChart
                        ? 'Select category and value fields to preview chart'
                        : 'Select axes to preview chart'}
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
