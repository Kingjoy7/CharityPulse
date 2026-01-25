import { render, screen, act, waitFor } from '@testing-library/react';
import AdminDashboard from '../../src/frontend/pages/admin/dashboard';
import { AuthContext } from '../../src/frontend/contexts/AuthContext';
import '@testing-library/jest-dom';

// Mock the router
const mockRouter = {
  push: jest.fn(),
};
jest.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

// Mock fetch
global.fetch = jest.fn();
// Mock confirm
global.confirm = jest.fn(() => true);

// Mock auth context
const mockAuthContext = {
  user: { role: 'Admin', email: 'admin@test.com' },
  token: 'fake-admin-token',
  loading: false,
};

const renderWithAuth = (component, authValue = mockAuthContext) => {
  return render(
    <AuthContext.Provider value={authValue}>
      {component}
    </AuthContext.Provider>
  );
};

describe('Admin Dashboard Page', () => {
  beforeEach(() => {
    fetch.mockClear();
    mockRouter.push.mockClear();
    confirm.mockClear();
  });

  it('CEFTS-17: fetches and displays lists of users and events', async () => {
    // Mock for /users
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([
        { _id: '123', email: 'admin@test.com', role: 'Admin', isRevoked: false },
        { _id: '456', email: 'user@test.com', role: 'Organizer', isRevoked: false },
      ]),
    });
    // Mock for /events
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([
        { _id: 'evt1', title: 'Test Event', organizer: { email: 'user@test.com' }, status: 'Active', targetGoal: 1000 },
      ]),
    });

    await act(async () => {
      renderWithAuth(<AdminDashboard />);
    });

    // Check that fetches were called
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5001/api/admin/users',
        expect.objectContaining({ headers: { 'x-auth-token': 'fake-admin-token' } })
      );
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5001/api/admin/events',
        expect.objectContaining({ headers: { 'x-auth-token': 'fake-admin-token' } })
      );
    });

    // --- THIS IS THE FIX ---
    // Use getAllByText to find all instances
    expect(screen.getByText('admin@test.com')).toBeInTheDocument();
    const userEmails = screen.getAllByText('user@test.com');
    expect(userEmails).toHaveLength(2); // One in users table, one in events table
    // -----------------------
    
    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });
});