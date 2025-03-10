import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { jest } from '@jest/globals';
import React from 'react';

// Add TextEncoder and TextDecoder to the global scope
// These are required by some dependencies but not available in the Jest environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock CSS modules
jest.mock('*.css', () => ({}), { virtual: true });

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: '/projects/test',
  }),
}));

// Mock @heroui components
jest.mock('@heroui/navbar', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="navbar-mock" />),
  NavbarBrand: jest.fn(({ children }) => <div data-testid="navbar-brand-mock">{children}</div>),
  NavbarContent: jest.fn(({ children }) => <div data-testid="navbar-content-mock">{children}</div>),
  NavbarItem: jest.fn(({ children }) => <div data-testid="navbar-item-mock">{children}</div>),
  NavbarMenu: jest.fn(({ children }) => <div data-testid="navbar-menu-mock">{children}</div>),
  NavbarMenuToggle: jest.fn(({ children }) => <div data-testid="navbar-menu-toggle-mock">{children}</div>),
  NavbarMenuItem: jest.fn(({ children }) => <div data-testid="navbar-menu-item-mock">{children}</div>),
}));

jest.mock('@heroui/button', () => ({
  __esModule: true,
  default: jest.fn(({ children, ...props }) => (
    <button data-testid="button-mock" {...props}>{children}</button>
  )),
}));

jest.mock('@heroui/card', () => ({
  __esModule: true,
  default: jest.fn(({ children, ...props }) => (
    <div data-testid="card-mock" {...props}>{children}</div>
  )),
  CardBody: jest.fn(({ children }) => <div data-testid="card-body-mock">{children}</div>),
  CardHeader: jest.fn(({ children }) => <div data-testid="card-header-mock">{children}</div>),
  CardFooter: jest.fn(({ children }) => <div data-testid="card-footer-mock">{children}</div>),
}));

// Mock heroicons
const mockIcon = jest.fn(({ ...props }) => <svg data-testid="icon-mock" {...props} />);

jest.mock('@heroicons/react/24/solid', () => ({
  HomeIcon: mockIcon,
  UserIcon: mockIcon,
}));

jest.mock('@heroicons/react/24/outline', () => ({
  MapPinIcon: mockIcon,
  CurrencyRupeeIcon: mockIcon,
  CalendarDateRangeIcon: mockIcon,
  UserIcon: mockIcon,
  LinkIcon: mockIcon,
}));

// Suppress console errors during tests
const originalError = console.error;
console.error = (...args) => {
  if (
    /Warning: ReactDOM.render is no longer supported in React 18/.test(args[0]) ||
    /Warning: useLayoutEffect does nothing on the server/.test(args[0]) ||
    /Error: Uncaught \[Error:/.test(args[0])
  ) {
    return;
  }
  originalError.call(console, ...args);
};
