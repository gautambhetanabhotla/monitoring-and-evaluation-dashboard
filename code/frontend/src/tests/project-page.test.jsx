import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/';

import ProjectPage from '../project-view/project-page';

test('renders ProjectPage component with correct elements', () => {
  render(<ProjectPage />);

  // Check for the project name element
  const projectNameElement = screen.getByText(/Project name/i);
  expect(projectNameElement).toBeInTheDocument();
  expect(projectNameElement).toHaveClass('text-7xl');

  // Check for the client name element
  const clientNameElement = screen.getByText(/Client name/i);
  expect(clientNameElement).toBeInTheDocument();
  expect(clientNameElement).toHaveClass('text-3xl');

  // Check for the project description element
  const projectDescriptionElement = screen.getByText(/Project description/i);
  expect(projectDescriptionElement).toBeInTheDocument();
  expect(projectDescriptionElement).toHaveClass('text-2xl');

  // Check for the overview element
  const overviewElement = screen.getByText(/Overview/i);
  expect(overviewElement).toBeInTheDocument();
  expect(overviewElement).toHaveClass('text-6xl');

  // Check for the project structure element
  const projectStructureElement = screen.getByText(/Project structure/i);
  expect(projectStructureElement).toBeInTheDocument();
  expect(projectStructureElement).toHaveClass('text-6xl');
});