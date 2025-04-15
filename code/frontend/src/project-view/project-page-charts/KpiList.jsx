import React, { useEffect, useState } from 'react';

const KpiList = ({ projectId, onSelectKpi, selectedKpiId }) => {
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/visualisation/get-KpibyProject/${projectId}`, { credentials: 'include' });
        const result = await response.json();
        if (result.success) {
          setKpis(result.data);
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

  if (kpis.length === 0) {
    return <div className="p-4 text-center text-red-500">No KPIs found</div>;
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-4 text-gray-900">Select KPI</h3>
      <ul className="space-y-2">
        {kpis.map((kpi) => {
          const isSelected = kpi._id === selectedKpiId;
          return (
            <li
            key={kpi._id}
            onClick={() => onSelectKpi(kpi)}
            tabIndex={0}
            className={`cursor-pointer border p-2 rounded
              focus:outline-none focus:ring-0 active:ring-0
              ${
                isSelected
                  ? 'bg-blue-500 border-blue-500'
                  : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
              }`}
          >
            <span className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
              {kpi.indicator}
            </span>
          </li>
          );
        })}
      </ul>
    </div>
  );
};

export default KpiList;
