import React, { useState, useEffect } from 'react';
import ChartComponent from './ChartComponent';
import { PlusCircle } from 'lucide-react';

const Canvas = ({ charts = [], onAddChart, onEditChart, onRemoveChart }) => {
  const chartsArray = Array.isArray(charts) ? charts : [];
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
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Data Visualization Dashboard</h1>
        { user?.role === 'admin' &&
        <button
          onClick={onAddChart}
          className="btn btn-primary btn-icon"
        >
          <PlusCircle size={20} />
          <span>Add New Visualization</span>
        </button>
        }
      </div>

      {charts.length === 0 ? (
        user?.role === 'admin' ? (
          <div className="empty-state">
            { user?.role === 'admin' &&
              <div className="empty-icon-container">
                <PlusCircle size={48} className="empty-icon" />
              </div>
            }
            { user?.role === 'admin' &&
              <p className="empty-text">No Visualizations Yet</p>
            }
            { user?.role === 'admin' &&
              <button
                onClick={onAddChart}
                className="btn btn-primary"
              >
                Add The First Visualization
              </button>
            }
          </div>
        ) : (
          <p className='empty-text'>No Visualizations Available</p>
        )
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