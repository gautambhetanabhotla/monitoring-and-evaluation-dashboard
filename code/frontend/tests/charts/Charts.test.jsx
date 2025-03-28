import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import Charts from '../../src/project-view/project-page-charts.jsx';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({
        success: true,
        data: [
          {
            _id: '1',
            title: 'Test Chart',
            type: 'bar',
            file: JSON.stringify([{ x: 'A', y: 10 }]),
            component_1: 'x',
            component_2: 'y',
            columns: ['x', 'y'],
            category: 'file',
            kpi_id: 'k1'
          }
        ]
      })
    })
  );
  

describe('Charts Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('fetches and renders charts from API', async () => {
    const chartsData = {
      success: true,
      data: [
        {
          _id: '1',
          title: 'Test Chart',
          type: 'bar',
          file: JSON.stringify([{ x: 'A', y: 10 }]),
          component_1: 'x',
          component_2: 'y',
          columns: ['x', 'y'],
          category: 'file',
          kpi_id: 'k1'
        }
      ]
    };
    fetch.mockResolvedValueOnce({
      json: async () => chartsData,
    });

    render(
      <MemoryRouter initialEntries={['/project/123']}>
        <Routes>
          <Route path="/project/:projectid" element={<Charts />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(screen.getByText(/Data Visualization Dashboard/i)).toBeInTheDocument();
  });
});
