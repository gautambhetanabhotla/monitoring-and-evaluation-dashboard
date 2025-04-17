import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Canvas from './project-page-charts/Canvas';
import ChartModal from './project-page-charts/ChartModal';

function Charts() {
  const [charts, setCharts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChartId, setEditingChartId] = useState(null);
  const { projectid } = useParams();

  useEffect(() => {
    const fetchCharts = async () => {
      try {
        const response = await fetch(`/api/visualisation/get-visualisations/${projectid}`,
          {
            credentials: 'include',         }
        );
        const results = await response.json();
        if (results.success && Array.isArray(results.data)) {
          const formattedCharts = results.data.map(item => {
            try {
              const data = JSON.parse(item.file);
              return {
                id: item._id,
                title: item.title,
                type: item.type,
                data: Array.isArray(data) ? data : [],
                xAxis: item.component_1,
                yAxis: item.component_2,
                categoryField: item.component_1,
                valueField: item.component_2,
                columns: item.columns,
                category: item.category,
                kpi_id: item.kpi_id,
                colors: item.colors,
                Mode: item.Mode,
              };
            } catch (error) {
              console.error('Error parsing chart data:', error);
              return null;
            }
          }).filter(chart => chart !== null);
          setCharts(formattedCharts);
        }
        else {
          setCharts([]);
        }
      }
      catch (error) {
        console.error('Error fetching charts:', error);
        setCharts([]);
      }
    };
    fetchCharts();
  }, []);

  const handleAddChart = () => {
    setEditingChartId(null);
    setIsModalOpen(true);
  };

  const handleEditChart = (id) => {
    setEditingChartId(id);
    setIsModalOpen(true);
  };

  const onRemoveChart = (id) => {
    try {
      fetch(`/api/visualisation/delete-visualisation/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setCharts(charts.filter((chart) => chart.id !== id));
    } catch (error) { 
      console.error('Error deleting chart:', error);
    }
  };

  const handleSaveChart = async(chartConfig) => {
    if (editingChartId) {
      console.log(editingChartId);
      setCharts(charts.map((chart) => (chart.id === editingChartId ? chartConfig : chart)));
      const chartData = {
        project_id: projectid,
        title : chartConfig.title,
        file: JSON.stringify(chartConfig.data),
        type: chartConfig.type,
        component_1: chartConfig.xAxis || chartConfig.categoryField,
        component_2: chartConfig.yAxis || chartConfig.valueField,
        columns : chartConfig.columns,
        category: chartConfig.category,
        kpi_id: chartConfig.kpi_id,
        colors: chartConfig.colors,
        Mode: chartConfig.Mode
      };
      try {
        const response= await fetch(`/api/visualisation/update-visualisation/${editingChartId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(chartData),
        });
        const data = await response.json();
        console.log(data);
        chartConfig.id = data.id;
        setCharts(charts.map((chart) => (chart.id === editingChartId ? chartConfig : chart)));
      } 
      catch (error) {
        console.error('Error saving chart:', error);
      }
    } else {
      setCharts([chartConfig, ...charts]);
      const chartData = {
        project_id: projectid,
        title : chartConfig.title,
        file: JSON.stringify(chartConfig.data),
        type: chartConfig.type,
        component_1: chartConfig.xAxis || chartConfig.categoryField,
        component_2: chartConfig.yAxis || chartConfig.valueField,
        columns : chartConfig.columns,
        category: chartConfig.category,
        kpi_id: chartConfig.kpi_id,
        colors: chartConfig.colors,
        Mode: chartConfig.Mode
      };
      try {
        const response= await fetch('/api/visualisation/save-visualisation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(chartData),
        });
        const data = await response.json();
        console.log(data);
        chartConfig.id = data.id;
        setCharts([chartConfig, ...charts]);
      } catch (error) {
        console.error('Error saving chart:', error);
      }
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