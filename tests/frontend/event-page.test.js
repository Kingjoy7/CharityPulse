import { render, screen, act } from '@testing-library/react';
import EventPage from '../../src/frontend/pages/event/[id]';
import '@testing-library/jest-dom';

// Mock the router
const mockRouter = {
    query: { id: '123' },
};
jest.mock('next/router', () => ({
    useRouter: () => mockRouter,
}));

// Mock fetch
global.fetch = jest.fn();

// Mock child components
jest.mock('../../src/frontend/components/ProgressBar', () => () => <div data-testid="mock-progress-bar" />);
jest.mock('../../src/frontend/components/PledgeForm', () => () => <div data-testid="mock-pledge-form" />);

describe('Public Event Page', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    it('CEFTS-4/8: fetches and displays event data, progress bar, and pledge form', async () => {
        // Mock the successful API call
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                title: 'Test Event',
                description: 'My test description',
                targetGoal: 1000,
                totalPledged: 250,
                progress: 25.0
            }),
        });

        await act(async () => {
            render(<EventPage />);
        });

        // Check that fetch was called correctly
        expect(fetch).toHaveBeenCalledWith('http://localhost:5001/api/events/123');

        // Check that all components are rendered
        expect(screen.getByRole('heading', { name: 'Test Event' })).toBeInTheDocument();
        expect(screen.getByText('My test description')).toBeInTheDocument();
        expect(screen.getByTestId('mock-progress-bar')).toBeInTheDocument();
        expect(screen.getByTestId('mock-pledge-form')).toBeInTheDocument();
    });

    it('shows an error message if the fetch fails', async () => {
        // Mock a failed API call
        fetch.mockResolvedValueOnce({
            ok: false,
        });

        await act(async () => {
            render(<EventPage />);
        });

        expect(screen.getByText('Failed to fetch event data. It may not exist.')).toBeInTheDocument();
    });
});
