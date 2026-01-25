import { render, screen, fireEvent, act } from '@testing-library/react';
import Login from '../../src/frontend/pages/login';
import '@testing-library/jest-dom';

// 1. Mock the AuthContext
const mockLogin = jest.fn();
// --- FIX: Import the *named* AuthContext ---
import { AuthContext } from '../../src/frontend/contexts/AuthContext';

jest.mock('../../src/frontend/contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
  // --- FIX: Export the context itself for the provider ---
  AuthContext: ({ children, value }) => <div>{children}</div>, 
}));

// 2. Mock the Next.js Router
const mockRouter = {
  query: {}, // Default query
  push: jest.fn(),
};
jest.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

// 3. Mock the 'fetch' function
global.fetch = jest.fn();


describe('Login Page', () => {

  // Reset all mocks before each test
  beforeEach(() => {
    mockLogin.mockClear();
    mockRouter.push.mockClear();
    global.fetch.mockClear();
    mockRouter.query = {}; // Reset query
  });

  it('CFTF-15: renders User Login form by default', () => {
    render(<Login />);
    
    // It defaults to 'User Login'
    expect(screen.getByRole('heading')).toHaveTextContent('User Login');
    expect(screen.getByLabelText('Email:')).toBeInTheDocument();
    expect(screen.getByLabelText('Password:')).toBeInTheDocument();
  });

  it('renders Organizer Login form when role is organizer', () => {
    // --- THIS IS THE FIX ---
    // Set the URL query to the *capitalized* role
    mockRouter.query = { role: 'Organizer' }; 
    // -----------------------
    
    render(<Login />);
    
    // It reads the query and sets the title
    expect(screen.getByRole('heading')).toHaveTextContent('Organizer Login');
  });

  it('CFTF-15: shows an error message on failed login', async () => {
    // Mock a failed fetch response
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ msg: 'Invalid credentials' }),
    });

    render(<Login />);

    await act(async () => {
      fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'test@fail.com' } });
      fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'wrong' } });
      fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    });
    
    // Check that the error message appears
    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
    // Check that our global 'login' function was *not* called
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('CFTF-15: calls auth context login on successful login (no MFA)', async () => {
    // Mock a successful fetch response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'fake-token-123', role: 'User' }),
    });

    render(<Login />);

    await act(async () => {
      fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'test@success.com' } });
      fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'correct' } });
      fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    });
    
    // Check that our global 'login' function *was* called with the token
    expect(mockLogin).toHaveBeenCalledWith('fake-token-123');
  });

  it('redirects to 2FA page if MFA is required', async () => {
    // Mock a successful fetch that requires MFA
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ mfaRequired: true, userId: 'user123' }),
    });

    render(<Login />);

    await act(async () => {
      fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'test@mfa.com' } });
      fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'correct' } });
      fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    });
    
    // Check that our global 'login' function was *not* called
    expect(mockLogin).not.toHaveBeenCalled();
    // Check that we were redirected to the 2FA page
    expect(mockRouter.push).toHaveBeenCalledWith('/login-2fa?userId=user123');
  });
});