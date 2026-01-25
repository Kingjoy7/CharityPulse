import { render, screen, act, waitFor } from '@testing-library/react';
import Dashboard from '../../../src/frontend/pages/organiser/dashboard';
import { AuthContext } from '../../../src/frontend/contexts/AuthContext';
import '@testing-library/jest-dom';

// --- 1. MOCK THE ROUTER ---
const mockRouter = {
  push: jest.fn(),
};
jest.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));
// --------------------------

// Mock fetch
global.fetch = jest.fn();

// Mock child components
jest.mock('../../../src/frontend/components/CloseEventButton', () => () => <button>Close Event</button>);
jest.mock('../../../src/frontend/components/ProgressBar', () => () => <div data-testid="mock-progress-bar" />);

// --- 2. MOCK AUTH CONTEXT ---
const mockAuthContext = {
  user: { role: 'Organizer' },
  token: 'fake-token-123',
  loading: false,
};

const renderWithAuth = (component, authValue = mockAuthContext) => {
  return render(
    <AuthContext.Provider value={authValue}>
      {component}
    </AuthContext.Provider>
  );
};
// ----------------------------

describe('Organiser Dashboard Page', () => {
  beforeEach(() => {
    fetch.mockClear();
    mockRouter.push.mockClear();
    jest.clearAllMocks();
  });

  it('shows loading state when auth is loading', async () => {
    await act(async () => {
      renderWithAuth(<Dashboard />, { user: null, token: null, loading: true });
    });
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('redirects if user is not authenticated', async () => {
    await act(async () => {
      renderWithAuth(<Dashboard />, { user: null, token: null, loading: false });
    });
    expect(mockRouter.push).toHaveBeenCalledWith('/select-login');
  });

  it('fetches and displays the organiser events successfully', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([
        { _id: 'evt1', title: 'My First Event', status: 'Active', targetGoal: 1000, totalPledged: 200, progress: 20, description: 'Desc 1' },
      ]),
    });

    await act(async () => {
      renderWithAuth(<Dashboard />);
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5001/api/events/my-events',
        expect.objectContaining({ headers: { 'x-auth-token': 'fake-token-123' } })
      );
    });

    expect(screen.getByText('My First Event')).toBeInTheDocument();
  });

  it('shows an error message if fetch fails (non-JSON response)', async () => {
    // Mock a failed fetch (e.g., 500 error, not JSON)
    fetch.mockResolvedValueOnce({
      ok: false,
      headers: new Headers({ 'Content-Type': 'text/html' }),
      text: async () => 'Internal Server Error' // Mock the .text() function
    });

    await act(async () => {
      renderWithAuth(<Dashboard />);
    });

    // 3. CHECK FOR THE CORRECT ERROR MESSAGE
    await waitFor(() => {
      expect(screen.getByText('Internal Server Error')).toBeInTheDocument();
    });
  });
});