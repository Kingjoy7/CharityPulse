import { render, screen } from '@testing-library/react';
import EventCard from '../../src/frontend/components/EventCard';
import '@testing-library/jest-dom';

// Mock the ProgressBar component
jest.mock('../../src/frontend/components/ProgressBar', () => {
  return function MockProgressBar(props) {
    return <div data-testid="mock-progress-bar" />;
  };
});

describe('EventCard', () => {
  
  const mockEvent = {
    _id: '123',
    title: 'Test Event',
    description: 'This is a test description.', // Test with a short description
    targetGoal: 1000,
    progress: 50,
    totalPledged: 500
  };

  it('renders event details correctly', () => {
    render(<EventCard event={mockEvent} />);
    
    expect(screen.getByText('Test Event')).toBeInTheDocument();
    
    // This test is correct and will pass
    expect(screen.getByText('This is a test description.')).toBeInTheDocument();

    expect(screen.getByTestId('mock-progress-bar')).toBeInTheDocument();
  });

  it('renders a "View & Pledge" link', () => {
    render(<EventCard event={mockEvent} />);
    
    // This test is correct and will pass
    const link = screen.getByRole('link', { name: 'View & Pledge' });

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/event/123');
  });

  it('truncates a long description', () => {
    const longDescEvent = {
      ...mockEvent,
      description: 'This is a very long description that is definitely over 100 characters and should absolutely be truncated by the component logic, otherwise this test will fail.'
    };
    render(<EventCard event={longDescEvent} />);

    // --- THIS IS THE FIX ---
    // Update the expected text to match the component's substring(0, 100) output
    const truncatedText = 'This is a very long description that is definitely over 100 characters and should absolutely be trun...';
    // -----------------------
    
    expect(screen.getByText(truncatedText)).toBeInTheDocument();
  });
});
