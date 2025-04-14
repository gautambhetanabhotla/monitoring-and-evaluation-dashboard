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
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [category, setCategory] = useState('');
  const [kpiError, setKpiError] = useState('');
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
      if (editingChart.type === 'pie') {
        setCategoryField(editingChart.categoryField || '');
        setValueField(editingChart.valueField || '');
      } else {
        setXAxis(editingChart.xAxis || '');
        setYAxis(editingChart.yAxis || '');
        setSelectedColor(editingChart.colors?.backgroundColor[0] || '#3b82f6');
      }
      setTitle(editingChart.title);
      setSelectedKpi({ _id: editingChart.kpi_id });
      setCategory(editingChart.category || '');
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
    setSelectedColor('#3b82f6');
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
      if (chartType === 'pie') {
        setCategoryField(newColumns[0]);
        setValueField(newColumns.slice(1));
      } else {
        setXAxis(newColumns[0]);
        setYAxis(newColumns.slice(1));
      }
    }
  };

  useEffect(() => {
    if (columns.length >= 2) {
      if (chartType === 'pie') {
        if (!categoryField) setCategoryField(xAxis || columns[0]);
        if (!valueField) setValueField(yAxis || columns.slice(1));
      } else {
        if (!xAxis) setXAxis(categoryField || columns[0]);
        if (!yAxis) setYAxis(valueField || columns.slice(1));
      }
    }
  }, [chartType, columns]);

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

    if (chartType === 'pie') {
      chartConfig.categoryField = categoryField;
      chartConfig.valueField = valueField;
    } else {
      chartConfig.xAxis = xAxis;
      chartConfig.yAxis = yAxis;
      chartConfig.colors={
        backgroundColor: [selectedColor],
        borderColor: [selectedColor],
      };
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
            backgroundColor: selectedColor,
            borderColor: selectedColor,
          },
        ],
      };
    } else {
      return {
        labels: data.map((item) => item[xAxis]?.toString() || ''),
        datasets: [
          {
            label: yAxis[0],
            data: data.map((item) => Number(item[yAxis[0]]) || 0),
            backgroundColor: selectedColor,
            borderColor:    selectedColor,
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
    ...(chartType !== 'pie' && {
      scales: {
        x: {
          ticks: {
            color: '#000000',
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
        },
        y: {
          ticks: {
            color: '#000000',
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
        },
      },
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
        return <Pie data={chartData} options={options} />;
      case 'scatter':
        return <Scatter data={chartData} options={options} />;
      default:
        return <div>Select a chart type</div>;
    }
  };

  const isPieChart = chartType === 'pie';
  const isAxisBasedChart = !isPieChart;
  const canPreview = isPieChart ? (categoryField && valueField) : (xAxis && yAxis);
  const canSave = canPreview;

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
                  <div className="form-grid flex gap-2">
                    {['bar', 'line', 'pie', 'scatter'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setChartType(type)}
                        className={`btn px-3 py-2 rounded ${
                          chartType === type ? 'btn-primary' : 'btn-secondary'
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
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
                          value={selectedColor}
                          onChange={(e) => setSelectedColor(e.target.value)}
                          className="w-8 h-8 p-0 border-0"
                        />
                      </div>
                  </div>
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
                  <button className="btn btn-secondary px-4 py-2 rounded" onClick={() => setStep(0)}>
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
