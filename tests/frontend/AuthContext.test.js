import { render, screen, act, fireEvent } from '@testing-library/react';
import { AuthProvider, useAuth, AuthContext } from '../../src/frontend/contexts/AuthContext';
import { jwtDecode } from 'jwt-decode';
import '@testing-library/jest-dom';

// --- Mocks ---
const mockRouter = {
  push: jest.fn(),
  pathname: '/',
};
jest.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

jest.mock('jwt-decode');

// A helper component to consume and display context values
const TestConsumer = () => {
  const { user, token, loading, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      {user && <div data-testid="user-role">{user.role}</div>}
      {token && <div data-testid="token">{token}</div>}
      <button onClick={() => login(
        // A fake token for an Organizer
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiMTIzNDUiLCJyb2xlIjoiT3JnYW5pemVyIiwiZW1haWwiOiJ0ZXN0QG9yZy5jb20ifX0.fake'
      )}>Login Organizer</button>
      <button onClick={() => login(
        // A fake token for an Admin
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjU0MzIxIiwicm9sZSI6IkFkbWluIiwiZW1haWwiOiJ0ZXN0QGFkbWluLmNvbSJ9fQ.fake'
      )}>Login Admin</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

// --- Tests ---
describe('AuthContext', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('loads with no user if no token in localStorage', () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.queryByTestId('user-role')).not.toBeInTheDocument();
  });

  it('loads a user if a valid token is in localStorage', () => {
    const validToken = 'valid.token.here';
    const decodedUser = { user: { id: '1', role: 'User', email: 'user@test.com' }, exp: Date.now() / 1000 + 3600 };
    jwtDecode.mockReturnValue(decodedUser);
    localStorage.setItem('token', validToken);

    render(<AuthProvider><TestConsumer /></AuthProvider>);

    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('user-role')).toHaveTextContent('User');
    expect(screen.getByTestId('token')).toHaveTextContent(validToken);
  });

  it('logs out user if token is expired', () => {
    const expiredToken = 'expired.token.here';
    const decodedUser = { user: { id: '1', role: 'User' }, exp: Date.now() / 1000 - 3600 }; // Expired
    jwtDecode.mockReturnValue(decodedUser);
    localStorage.setItem('token', expiredToken);

    render(<AuthProvider><TestConsumer /></AuthProvider>);

    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.queryByTestId('user-role')).not.toBeInTheDocument();
  });

  it('login function sets user, token, and redirects organizer', async () => {
    const decodedOrganizer = { user: { id: '12345', role: 'Organizer', email: 'test@org.com' } };
    jwtDecode.mockReturnValue(decodedOrganizer);
    
    render(<AuthProvider><TestConsumer /></AuthProvider>);

    await act(async () => {
      fireEvent.click(screen.getByText('Login Organizer'));
    });

    expect(screen.getByTestId('user-role')).toHaveTextContent('Organizer');
    expect(mockRouter.push).toHaveBeenCalledWith('/organiser/dashboard');
  });

  it('login function sets user, token, and redirects admin', async () => {
    const decodedAdmin = { user: { id: '654321', role: 'Admin', email: 'test@admin.com' } };
    jwtDecode.mockReturnValue(decodedAdmin);
    
    render(<AuthProvider><TestConsumer /></AuthProvider>);

    await act(async () => {
      fireEvent.click(screen.getByText('Login Admin'));
    });

    expect(screen.getByTestId('user-role')).toHaveTextContent('Admin');
    expect(mockRouter.push).toHaveBeenCalledWith('/admin/dashboard');
  });

  it('logout function clears user, token, and redirects', async () => {
    // 1. Log in first
    const validToken = 'valid.token.here';
    const decodedUser = { user: { id: '1', role: 'User', email: 'user@test.com' }, exp: Date.now() / 1000 + 3600 };
    jwtDecode.mockReturnValue(decodedUser);
    localStorage.setItem('token', validToken);

    render(<AuthProvider><TestConsumer /></AuthProvider>);
    
    // Verify user is logged in
    expect(screen.getByTestId('user-role')).toHaveTextContent('User');
    
    // 2. Click Logout
    await act(async () => {
      fireEvent.click(screen.getByText('Logout'));
    });
    
    // 3. Verify user is logged out
    expect(screen.queryByTestId('user-role')).not.toBeInTheDocument();
    expect(mockRouter.push).toHaveBeenCalledWith('/select-login');
  });
});