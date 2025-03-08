import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/';
import { MemoryRouter } from 'react-router-dom';

// Mock the problematic components
jest.mock('@heroui/navbar', () => ({
  Navbar: ({ children }) => <div data-testid="navbar">{children}</div>,
  NavbarBrand: ({ children }) => <div data-testid="navbar-brand">{children}</div>,
  NavbarContent: ({ children }) => <div data-testid="navbar-content">{children}</div>,
  NavbarItem: ({ children }) => <div data-testid="navbar-item">{children}</div>,
  NavbarMenuToggle: () => <div data-testid="navbar-menu-toggle" />,
  NavbarMenu: ({ children }) => <div data-testid="navbar-menu">{children}</div>,
  NavbarMenuItem: ({ children }) => <div data-testid="navbar-menu-item">{children}</div>,
}), { virtual: true });

jest.mock('@heroui/card', () => ({
  Card: ({ children, className }) => <div data-testid="card" className={className}>{children}</div>,
  CardHeader: ({ children }) => <div data-testid="card-header">{children}</div>,
}), { virtual: true });

jest.mock('@heroicons/react/24/solid', () => ({
  HomeIcon: () => <div data-testid="home-icon" />,
}), { virtual: true });

jest.mock('@heroicons/react/24/outline', () => ({
  MapPinIcon: () => <div data-testid="map-pin-icon" />,
  CurrencyRupeeIcon: () => <div data-testid="currency-rupee-icon" />,
  CalendarDateRangeIcon: () => <div data-testid="calendar-date-range-icon" />,
  UserIcon: () => <div data-testid="user-icon" />,
  LinkIcon: () => <div data-testid="link-icon" />,
}), { virtual: true });

// Import the component we're testing
import { ProjectHeader } from '../project-view/project-page';

describe('ProjectHeader Component', () => {
  test('renders project name text', () => {
    render(
      <MemoryRouter>
        <ProjectHeader />
      </MemoryRouter>
    );

    // Test for the project name which is in a prose element
    const projectNameElement = screen.getByText(/Project name/i);
    expect(projectNameElement).toBeInTheDocument();
  });

  test('renders location and client information', () => {
    render(
      <MemoryRouter>
        <ProjectHeader />
      </MemoryRouter>
    );

    // Test for text elements that are stable and present
    const locationElement = screen.getByText(/Location/i);
    expect(locationElement).toBeInTheDocument();

    const clientElement = screen.getByText(/Client/i);
    expect(clientElement).toBeInTheDocument();
  });

  test('renders navigation items for project sections', () => {
    render(
      <MemoryRouter>
        <ProjectHeader />
      </MemoryRouter>
    );

    // Check if navigation links are present
    const overviewLink = screen.getByText(/Overview/i);
    expect(overviewLink).toBeInTheDocument();

    const kpisLink = screen.getByText(/KPIs/i);
    expect(kpisLink).toBeInTheDocument();

    const timelineLink = screen.getByText(/Timeline/i);
    expect(timelineLink).toBeInTheDocument();
  });
});
