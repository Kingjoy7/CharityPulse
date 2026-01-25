import { render, screen, act } from '@testing-library/react';
import EventSummary from '../../src/frontend/pages/reports/summary/[id]';
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

describe('Event Summary Page', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    it('CEFTS-21: fetches and displays event summary data', async () => {
        // Mock the successful API call
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                title: 'Test Event',
                description: 'My test description',
                status: 'Active',
                targetGoal: 1000,
                totalPledged: 250,
                pledgeCount: 5,
                progress: 25.0
            }),
        });

        await act(async () => {
            render(<EventSummary />);
        });

        // Check that fetch was called correctly
        expect(fetch).toHaveBeenCalledWith('http://localhost:5001/api/reports/123/summary');

        // Check that all data is rendered
        expect(screen.getByRole('heading', { name: 'Event Summary' })).toBeInTheDocument();
        expect(screen.getByText('Test Event')).toBeInTheDocument();
        expect(screen.getByText('My test description')).toBeInTheDocument();
        const progressText = screen.getByText((content, element) => {
            return element.tagName.toLowerCase() === 'p' &&
                element.textContent.startsWith('Progress:') &&
                element.textContent.includes('25.00');
        });
        expect(progressText).toBeInTheDocument();
    });
});