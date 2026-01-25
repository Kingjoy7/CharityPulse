import { render, screen, fireEvent, act } from '@testing-library/react';
import ForgotPassword from '../../src/frontend/pages/forgot-password';
import '@testing-library/jest-dom';

// Mock the router
jest.mock('next/router', () => ({
    useRouter: () => ({}),
}));

// Mock fetch
global.fetch = jest.fn();

describe('Forgot Password Page', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    it('CEFTS-16: submits the email and shows a success message', async () => {
        // Mock the successful API call
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ msg: 'If an account with this email exists...' }),
        });

        await act(async () => {
            render(<ForgotPassword />);
        });

        // Fill out the form
        await act(async () => {
            fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'test@test.com' } });
            fireEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }));
        });

        // Check that fetch was called correctly
        expect(fetch).toHaveBeenCalledWith(
            'http://localhost:5001/api/auth/forgot-password',
            expect.objectContaining({
                body: JSON.stringify({ email: 'test@test.com' })
            })
        );

        // Check that the success message is shown
        expect(screen.getByText('If an account with this email exists...')).toBeInTheDocument();
    });
});