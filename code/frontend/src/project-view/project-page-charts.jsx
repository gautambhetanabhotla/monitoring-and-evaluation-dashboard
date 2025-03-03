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

  const handleSaveChart = (chartConfig) => {
    if (editingChartId) {
      setCharts(charts.map((chart) => (chart.id === editingChartId ? chartConfig : chart)));
    } else {
      setCharts([...charts, chartConfig]);
    }
  };

  const editingChart = editingChartId ? charts.find((chart) => chart.id === editingChartId) : undefined;

  return (
    <div className="app-container">
      <Canvas 
        charts={charts} 
        onAddChart={handleAddChart} 
        onEditChart={handleEditChart} 
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