import React from 'react';
import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import KpiList from '../../src/project-view/project-page-charts/KpiList.jsx';
import '@testing-library/jest-dom';

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ({
      success: true,
      data: [
        { _id: 'k1', indicator: 'KPI 1' },
        { _id: 'k2', indicator: 'KPI 2' },
      ],
    }),
  });
});

describe('KpiList Component', () => {
  const onSelectKpi = jest.fn();

  test('renders list of KPIs after loading', async () => {
    render(<KpiList projectId="123" onSelectKpi={onSelectKpi} selectedKpiId={null} />);
    
    expect(screen.getByText(/Loading KPIs.../i)).toBeInTheDocument();
    
    await waitFor(() => screen.getByText(/KPI 1/i));
    
    expect(screen.getByText(/KPI 1/i)).toBeInTheDocument();
    expect(screen.getByText(/KPI 2/i)).toBeInTheDocument();
  });

  test('calls onSelectKpi when a KPI is clicked', async () => {
    render(<KpiList projectId="123" onSelectKpi={onSelectKpi} selectedKpiId={null} />);
    await waitFor(() => screen.getByText(/KPI 1/i));
    fireEvent.click(screen.getByText(/KPI 1/i));
    expect(onSelectKpi).toHaveBeenCalledWith(expect.objectContaining({ _id: 'k1' }));
  });
});
