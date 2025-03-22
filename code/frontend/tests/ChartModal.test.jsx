import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import ChartModal from '../src/project-view/project-page-charts/ChartModal.jsx';
import { MemoryRouter } from 'react-router-dom';

jest.mock('react-chartjs-2', () => ({
    Bar: (props) => <div data-testid="chart-bar">Bar Chart</div>,
    Line: (props) => <div data-testid="chart-line">Line Chart</div>,
    Pie: (props) => <div data-testid="chart-pie">Pie Chart</div>,
    Scatter: (props) => <div data-testid="chart-scatter">Scatter Chart</div>,
  }));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ projectid: '123' }),
}));

describe('ChartModal', () => {
  const onClose = jest.fn();
  const onSave = jest.fn();

  beforeEach(() => {
    onClose.mockClear();
    onSave.mockClear();
  });

  test('does not render when isOpen is false', () => {
    const { container } = render(
      <ChartModal isOpen={false} onClose={onClose} onSave={onSave} editingChart={null} />
    );
    expect(container.firstChild).toBeNull();
  });

  test('renders modal header and back button in step 0', async () => {
    render(
      <MemoryRouter>
        <ChartModal isOpen={true} onClose={onClose} onSave={onSave} editingChart={null} />
      </MemoryRouter>
    );
    expect(screen.getByText(/Select Data Source/i)).toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', async () => {
    render(
      <MemoryRouter>
        <ChartModal isOpen={true} onClose={onClose} onSave={onSave} editingChart={null} />
      </MemoryRouter>
    );
    const closeButton = screen.getByRole('button', { name: '' }); 
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });
});
