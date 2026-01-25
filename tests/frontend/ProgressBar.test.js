import { render, screen } from '@testing-library/react';
import ProgressBar from '../../src/frontend/components/ProgressBar';
import '@testing-library/jest-dom';

describe('ProgressBar Component', () => {
  it('CFTF-12: renders correct percentage and amounts', () => {
    render(<ProgressBar progress={50} totalPledged={500} targetGoal={1000} />);
   
    // Check for the percentage
    expect(screen.getByText('50.00%')).toBeInTheDocument();
   
    // --- THIS IS THE FIX ---
    // Find a <p> tag whose text content (ignoring child tags)
    // contains all the required parts.
    const textElement = screen.getByText((content, element) => {
      return element.tagName.toLowerCase() === 'p' &&
             element.textContent === 'Raised: $500.00 / $1000.00';
    });
    expect(textElement).toBeInTheDocument();
    // -----------------------
  });

  it('CFTF-12: caps progress at 100%', () => {
    render(<ProgressBar progress={150} totalPledged={1500} targetGoal={1000} />);
   
    // Should show 100.00%
    expect(screen.getByText('100.00%')).toBeInTheDocument();
   
    // --- THIS IS THE FIX ---
    const textElement = screen.getByText((content, element) => {
      return element.tagName.toLowerCase() === 'p' &&
             element.textContent === 'Raised: $1500.00 / $1000.00';
    });
    expect(textElement).toBeInTheDocument();
    // -----------------------
  });
});