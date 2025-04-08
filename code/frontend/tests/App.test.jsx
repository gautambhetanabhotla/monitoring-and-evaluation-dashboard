import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/';
import { MemoryRouter } from 'react-router-dom';

import App from '../src/App.jsx';

describe('App component', () => {
  test('has all imports correct', () => {
    render(
      <App />
    );
    expect(0).toBe(0);
  });
});
