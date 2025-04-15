import React from 'react';
import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import Login from '../src/Login.jsx';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../src/AuthContext.jsx';

const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

const mockAuthContext = {
  login: jest.fn(),
};

const renderWithProviders = (component) => {
  return render(
    <AuthContext.Provider value={mockAuthContext}>
      <MemoryRouter>
        {component}
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

beforeEach(() => {
  mockAuthContext.login.mockReset();
  mockedNavigate.mockReset();
});

describe('Login Component', () => {
  test('renders login form with header, input fields, and login button', async () => {
    renderWithProviders(<Login />);

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
    mockAuthContext.login.mockResolvedValue({
      success: true,
      user: { role: 'admin' }
    });

    renderWithProviders(<Login />);

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'admin@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith('/clients');
    });
  });

  test('displays error message when login fails', async () => {
    mockAuthContext.login.mockResolvedValue({
      success: false,
      message: 'Login failed'
    });

    renderWithProviders(<Login />);
    
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpassword' } });

    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() =>
      expect(screen.getByText(/Login failed/i)).toBeInTheDocument()
    );
  });
});
