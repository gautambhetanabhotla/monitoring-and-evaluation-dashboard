import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import ChartComponent from '../src/project-view/project-page-charts/ChartComponent.jsx';
import '@testing-library/jest-dom';

jest.mock('react-chartjs-2', () => ({
    Bar: (props) => <div data-testid="chart-bar">Bar Chart</div>,
    Line: (props) => <div data-testid="chart-line">Line Chart</div>,
    Pie: (props) => <div data-testid="chart-pie">Pie Chart</div>,
    Scatter: (props) => <div data-testid="chart-scatter">Scatter Chart</div>,
  }));


beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ({ success: true, user: { role: 'admin' } }),
  });
});

describe('ChartComponent', () => {
  const onEdit = jest.fn();
  const onRemove = jest.fn();

  test('renders no data message when chart data is empty', async () => {
    render(<ChartComponent chart={{ type: 'bar', data: [] }} onEdit={onEdit} onRemove={onRemove} />);
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(screen.getByText(/No data available for this chart/i)).toBeInTheDocument();
  });

  test('renders chart when valid data is provided', async () => {
    const chart = {
      id: '1',
      title: 'Bar Chart',
      type: 'bar',
      data: [{ x: 'A', y: 10 }, { x: 'B', y: 20 }],
      xAxis: 'x',
      yAxis: 'y',
      categoryField: 'x',
      valueField: 'y',
      columns: ['x', 'y']
    };
    render(<ChartComponent chart={chart} onEdit={onEdit} onRemove={onRemove} />);
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(screen.getByText(/Bar Chart/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Remove visualization/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Edit visualization/i)).toBeInTheDocument();
  });
});
