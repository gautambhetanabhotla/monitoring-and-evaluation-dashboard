import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/';
import { MemoryRouter } from 'react-router-dom';

import { ProjectHeader } from '../src/project-view/project-header.jsx';
import { ProjectContext } from '../src/project-view/project-context.jsx';

// Custom render function that wraps component with all required providers
const renderProjectHeader = (overrides = {}) => {
  // Default mock project data
  const mockProject = {
    name: 'Example project 1',
    location: 'Hyderabad, India',
    client: 'ABC Trust',
    funding_partner: 'XYZ Foundation',
    start: "2023-10-05T14:48:00.000Z",
    end: "2024-10-05T14:48:00.000Z",
    ...overrides // Allow overriding specific properties for tests
  };

  // Return the render result in case we need utils like rerender
  return render(
    <MemoryRouter>
      <ProjectContext.Provider value={{ project: mockProject }}>
        <ProjectHeader />
      </ProjectContext.Provider> 
    </MemoryRouter>
  );
};

describe('ProjectHeader Component', () => {
  test('renders project name', () => {
    renderProjectHeader();
    
    const projectNameElement = screen.getByTestId("project-title");
    expect(projectNameElement).toHaveTextContent(/Example project 1/i);
  });

  test('renders location and client information', () => {
    renderProjectHeader();
    
    const locationElement = screen.getByText(/Hyderabad, India/i);
    expect(locationElement).toBeInTheDocument();

    const clientElement = screen.getByText(/ABC Trust/i);
    expect(clientElement).toBeInTheDocument();
  });

  test('renders start and end dates', () => {
    renderProjectHeader();
    
    const startDateElement = screen.getByText(/05\/10\/2023 to 05\/10\/2024/i);
    expect(startDateElement).toBeInTheDocument();
  });

  test('renders with custom project data', () => {
    renderProjectHeader({ 
      name: 'Custom Project', 
      location: 'Mumbai, India' 
    });
    
    expect(screen.getByText(/Custom Project/i)).toBeInTheDocument();
    expect(screen.getByText(/Mumbai, India/i)).toBeInTheDocument();
  });
});