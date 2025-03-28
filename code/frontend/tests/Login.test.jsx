import React from 'react';
import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import Login from '../src/Login.jsx';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ({ success: true, role: 'admin' }),
  });
  mockedNavigate.mockReset();
});

describe('Login Component', () => {
  test('renders login form with header, input fields, and login button', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument());

    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument()
    );
  });

  // test('shows error when email or password is missing', async () => {
  //   render(
  //     <MemoryRouter>
  //       <Login />
  //     </MemoryRouter>
  //   );

  //   fireEvent.click(screen.getByRole('button', { name: /Login/i }));

  //   await waitFor(() => {
  //     const errorMessages = screen.getAllByText(/Constraints not satisfied/i);
  //     expect(errorMessages.length).toBeGreaterThan(0);
  //   });
  // });

  test('navigates to the correct route on successful login for admin role', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ success: true, role: 'admin' }),
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'admin@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });

    
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith('/clients');
    });
  });

  test('displays error message when login fails', async () => {
    // Set fetch mock to return a failed login response
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ success: false, message: 'Login failed' }),
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpassword' } });

    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() =>
      expect(screen.getByText(/Login failed/i)).toBeInTheDocument()
    );
  });
});
