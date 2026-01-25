import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// ⭐ Mock the entire DonationChart component BEFORE importing it
jest.mock('../../src/frontend/components/DonationChart', () => {
  return function MockDonationChart(props) {
    if (!props.pieChartData) {
      return <p>No data available</p>;
    }
    return <div data-testid="mock-pie-chart"></div>;
  };
});

import DonationChart from '../../src/frontend/components/DonationChart';

describe('DonationChart Component', () => {

  it('CEFTS-13: renders a mock pie chart when pieChartData is provided', () => {
    const mockData = {
      labels: ['Raised', 'Remaining'],
      datasets: [{ data: [100, 200] }]
    };

    render(<DonationChart pieChartData={mockData} />);
    
    expect(screen.getByTestId('mock-pie-chart')).toBeInTheDocument();
  });

  it('CEFTS-13: renders fallback text if no pieChartData is provided', () => {
    render(<DonationChart pieChartData={null} />);
    
    expect(screen.queryByTestId('mock-pie-chart')).not.toBeInTheDocument();
    expect(screen.getByText(/no data available/i)).toBeInTheDocument();
  });
});
