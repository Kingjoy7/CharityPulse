import { render, screen, act } from '@testing-library/react';
import ReportPage from '../../src/frontend/pages/reports/[id]';
import '@testing-library/jest-dom';

// Mock the router
const mockRouter = {
  query: { id: '123' },
};
jest.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

// --- THIS IS THE FIX for "fetch is not defined" ---
global.fetch = jest.fn();
// -------------------------------------------------

// Mock child components
jest.mock('../../src/frontend/components/DonationChart', () => () => <div data-testid="mock-chart" />);

describe('Visual Report Page', () => {
  beforeEach(() => {
    fetch.mockClear(); // This line will now work
  });

  it('CEFTS-13: fetches and displays report data', async () => {
    // Mock the successful API call
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        topDonors: [
          { name: 'Alice', amount: 100 },
          { name: 'Bob', amount: 50 },
        ],
        pieChartData: { labels: ['Raised', 'Remaining'], datasets: [{ data: [150, 850] }] }
      }),
    });

    await act(async () => {
      render(<ReportPage />);
    });

    // Check that fetch was called correctly
    expect(fetch).toHaveBeenCalledWith('http://localhost:5001/api/reports/123/visuals');

    // Check that all components are rendered
    expect(screen.getByRole('heading', { name: 'Visual Reports' })).toBeInTheDocument();
    
    // --- THIS IS THE FIX for "Unable to find... Top 5 Donors" ---
    expect(screen.getByText('Top Donors')).toBeInTheDocument();
    // -----------------------------------------------------------
    
    expect(screen.getByText('Alice - $100.00')).toBeInTheDocument();
    expect(screen.getByText('Bob - $50.00')).toBeInTheDocument();
    expect(screen.getByTestId('mock-chart')).toBeInTheDocument();
  });
});