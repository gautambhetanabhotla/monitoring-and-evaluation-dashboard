import React, { useEffect, useState } from 'react';

const KpiList = ({ projectId, onSelectKpi, selectedKpiId }) => {
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/visualisation/get-KpibyProject/${projectId}`, { credentials: 'include' });
        const result = await response.json();
        if (result.success) {
          setKpis(result.data); // Assuming KPI array is returned in data.data
        } else {
          setError(result.message || 'Error fetching KPIs');
        }
      } catch (err) {
        console.error(err);
        setError('Error fetching KPIs');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchKpis();
    }
  }, [projectId]);

  if (loading) {
    return <div className="p-4 text-center">Loading KPIs...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4 text-gray-100">Select KPI</h3>
      <ul className="space-y-2">
        {kpis.map((kpi) => {
          const isSelected = kpi._id === selectedKpiId;
          return (
            <li
            key={kpi._id}
            onClick={() => onSelectKpi(kpi)}
            // Add tabIndex to ensure focus is possible for accessibility if needed
            tabIndex={0}
            className={`cursor-pointer border p-2 rounded text-white
                focus:outline-none focus:ring-0 active:ring-0
                ${
                isSelected
                    ? 'bg-blue-600 border-blue-600'
                    : 'bg-gray-800 border-gray-500 hover:bg-gray-600'
                }`}
            >
            <span className="font-semibold">{kpi.indicator}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default KpiList;
