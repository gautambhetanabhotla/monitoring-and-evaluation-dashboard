import React from 'react';
import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import Canvas from '../src/project-view/project-page-charts/Canvas.jsx';
import '@testing-library/jest-dom';

jest.mock('react-chartjs-2', () => ({
    Bar: () => <div data-testid="chart-bar" />,
    Line: () => <div data-testid="chart-line" />,
    Pie: () => <div data-testid="chart-pie" />,
    Scatter: () => <div data-testid="chart-scatter" />,
  }));

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ({ success: true, user: { role: 'admin' } }),
  });
});

describe('Canvas Component', () => {
  const onAddChart = jest.fn();
  const onEditChart = jest.fn();
  const onRemoveChart = jest.fn();
  const charts = [
    { id: '1', title: 'Chart 1', type: 'bar', data: [{ x: 'A', y: 10 }], xAxis: 'x', yAxis: 'y' },
  ];

  test('renders dashboard header and add button for admin', async () => {
    render(
      <Canvas 
        charts={charts} 
        onAddChart={onAddChart} 
        onEditChart={onEditChart} 
        onRemoveChart={onRemoveChart} 
      />
    );

    await waitFor(() => screen.getByText(/Data Visualization Dashboard/i));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Add New Visualization/i })).toBeInTheDocument()
    );
  });

  test('calls onAddChart when add button is clicked', async () => {
    render(
      <Canvas 
        charts={charts} 
        onAddChart={onAddChart} 
        onEditChart={onEditChart} 
        onRemoveChart={onRemoveChart} 
      />
    );

    const addButton = await waitFor(() =>
      screen.getByRole('button', { name: /Add New Visualization/i })
    );
    fireEvent.click(addButton);
    expect(onAddChart).toHaveBeenCalled();
  });
});
