import React from 'react';
import ChartComponent from './ChartComponent';
import { PlusCircle } from 'lucide-react';

const Canvas = ({ charts = [], onAddChart, onEditChart, onRemoveChart }) => {
  const chartsArray = Array.isArray(charts) ? charts : [];
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Data Visualization Dashboard</h1>
        <button
          onClick={onAddChart}
          className="btn btn-primary btn-icon"
        >
          <PlusCircle size={20} />
          <span>Add New Visualization</span>
        </button>
      </div>

      {charts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-container">
            <PlusCircle size={48} className="empty-icon" />
          </div>
          <p className="empty-text">No visualizations yet</p>
          <button
            onClick={onAddChart}
            className="btn btn-primary"
          >
            Add The First Visualization
          </button>
        </div>
      ) : (
        <div className="chart-grid">
          {charts.map((chart) => (
            <div key={chart.id} className="chart-card">
              <ChartComponent 
                chart={chart} 
                onEdit={() => onEditChart(chart.id)} 
                onRemove={() => onRemoveChart(chart.id)} 
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Canvas;