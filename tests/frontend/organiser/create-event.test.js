import { render, screen, fireEvent, act } from '@testing-library/react';
// --- FIX 1: Correct the import path ---
import CreateEvent from '../../../src/frontend/pages/organiser/create-event';
import { AuthContext } from '../../../src/frontend/contexts/AuthContext'; // <-- Import Context
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
// Mock localStorage
Storage.prototype.getItem = jest.fn(() => 'fake-token');

// --- FIX 2: Create a mock context wrapper ---
const mockAuthContext = {
  user: { role: 'Organizer' },
  token: 'fake-token',
  loading: false,
};

const renderWithAuth = (component) => {
  return render(
    <AuthContext.Provider value={mockAuthContext}>
      {component}
    </AuthContext.Provider>
  );
};
// ----------------------------------------

describe('Create Event Page', () => {
  beforeEach(() => {
    fetch.mockClear();
    mockRouter.push.mockClear();
  });

  it('CFTF-3: renders the create event form', () => {
    renderWithAuth(<CreateEvent />); // <-- Use wrapper
    expect(screen.getByRole('heading')).toHaveTextContent('Create New Fundraising Event');
    expect(screen.getByLabelText('Event Title:')).toBeInTheDocument();
  });

  it('CFTF-3: successfully creates an event and redirects', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '123', title: 'New Event' }),
    });

    await act(async () => {
      renderWithAuth(<CreateEvent />); // <-- Use wrapper
    });

    await act(async () => {
      fireEvent.change(screen.getByLabelText('Event Title:'), { target: { value: 'My New Event' } });
      fireEvent.change(screen.getByLabelText('Description:'), { target: { value: 'A great cause.' } });
      fireEvent.change(screen.getByLabelText('Target Goal ($):'), { target: { value: '1000' } });
      fireEvent.click(screen.getByRole('button', { name: 'Create Event' }));
    });
   
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:5001/api/events',
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': 'fake-token'
        }
      })
    );

    expect(mockRouter.push).toHaveBeenCalledWith('/organiser/dashboard');
  });
});
