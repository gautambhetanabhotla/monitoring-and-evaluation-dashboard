// import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/';

import ProjectPage, { ProjectHeader } from '../project-view/project-page';

test('renders ProjectPage component with correct elements', () => {
  render(<ProjectHeader />);

  // Check for the project name element
  const projectNameElement = screen.getByText(/Project name/i);
  expect(projectNameElement).toBeInTheDocument();
  expect(projectNameElement).toHaveClass('text-7xl');

  // Check for the client name element
  const clientNameElement = screen.getByText(/Client name/i);
  expect(clientNameElement).toBeInTheDocument();
  expect(clientNameElement).toHaveClass('text-3xl');
});