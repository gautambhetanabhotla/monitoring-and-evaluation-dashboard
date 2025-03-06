import React, { useState } from 'react';
import Canvas from './project-page-charts/Canvas';
import ChartModal from './project-page-charts/ChartModal';

function Charts() {
  const [charts, setCharts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChartId, setEditingChartId] = useState(null);

  const handleAddChart = () => {
    setEditingChartId(null);
    setIsModalOpen(true);
  };

  const handleEditChart = (id) => {
    setEditingChartId(id);
    setIsModalOpen(true);
  };

  const onRemoveChart = (id) => {
    // Remove the chart with the given ID
    const updatedCharts = charts.filter((chart) => chart.id !== id);
    setCharts(updatedCharts);
  };

  const handleSaveChart = async(chartConfig) => {
    if (editingChartId) {
      setCharts(charts.map((chart) => (chart.id === editingChartId ? chartConfig : chart)));
    } else {
      setCharts([...charts, chartConfig]);
    }

    const chartData = {
      title : chartConfig.title,
      file: JSON.stringify(chartConfig),
      type: chartConfig.type,
      component_1: chartConfig.xAxis || chartConfig.categoryField,
      component_2: chartConfig.yAxis || chartConfig.valueField,
    };
    // console.log(chartData.file);
    try {
      const response= await fetch('http://localhost:5000/project-page-charts/save-chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chartData),
      });
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Error saving chart:', error);
    }
  };

  const editingChart = editingChartId ? charts.find((chart) => chart.id === editingChartId) : undefined;

  return (
    <div className="app-container">
      <Canvas 
        charts={charts} 
        onAddChart={handleAddChart} 
        onEditChart={handleEditChart} 
        onRemoveChart={onRemoveChart}
      />
      
      <ChartModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveChart}
        editingChart={editingChart}
      />
    </div>
  );
}

export default Charts;