import { render, screen, fireEvent, act } from '@testing-library/react';
import Register from '../../src/frontend/pages/register';
import '@testing-library/jest-dom';

// 1. Mock the Next.js Router
const mockRouter = {
  query: {}, // Default query
  push: jest.fn(),
};
jest.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

// 2. Mock the 'fetch' function
global.fetch = jest.fn();

describe('Register Page', () => {

  // Reset all mocks before each test
  beforeEach(() => {
    mockRouter.push.mockClear();
    global.fetch.mockClear();
    mockRouter.query = {}; // Reset query
  });

  it('renders User Register form by default', () => {
    render(<Register />);
    
    expect(screen.getByRole('heading')).toHaveTextContent('Register as a User');
    expect(screen.getByLabelText('Email:')).toBeInTheDocument();
    expect(screen.getByLabelText('Password:')).toBeInTheDocument();
  });

  it('renders Organizer Register form when role is organizer', () => {
    // --- THIS IS THE FIX ---
    // Set the URL query to the *capitalized* role
    mockRouter.query = { role: 'Organizer' }; 
    // -----------------------
    
    render(<Register />);
    
    // It reads the query and sets the title
    expect(screen.getByRole('heading')).toHaveTextContent('Register as an Organizer');
  });

  it('submits the form and redirects on successful registration', async () => {
    // Mock a successful fetch response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ msg: 'Success' }),
    });
    
    // Render the default "User" registration
    render(<Register />);

    await act(async () => {
      fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'new@test.com' } });
      fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'correct' } });
      fireEvent.click(screen.getByRole('button', { name: 'Register' }));
    });
    
    // Check that fetch was called with the 'User' role
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:5001/api/auth/register',
      expect.objectContaining({
        body: JSON.stringify({ email: 'new@test.com', password: 'correct', role: 'User' })
      })
    );
    
    // --- THIS IS THE FIX ---
    // Check that we were redirected to the login page with the correct (capitalized) role
    expect(mockRouter.push).toHaveBeenCalledWith('/login?role=User');
    // -----------------------
  });

  it('shows an error message on failed registration', async () => {
    // Mock a failed fetch response
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ msg: 'User already exists' }),
    });

    render(<Register />);

    await act(async () => {
      fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'test@fail.com' } });
      fireEvent.change(screen.getByLabelText('Password:'), { target: { value: 'wrong' } });
      fireEvent.click(screen.getByRole('button', { name: 'Register' }));
    });
    
    // Check that the error message appears
    expect(await screen.findByText('User already exists')).toBeInTheDocument();
    // Check that we were not redirected
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});