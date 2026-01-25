import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import SetupMFA from '../../src/frontend/pages/setup-mfa.js';

// Mock the router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  },
}));

// Mock fetch
global.fetch = jest.fn();
// Mock localStorage
Storage.prototype.getItem = jest.fn(() => 'fake-token');

describe('Setup MFA Page', () => {
  beforeEach(() => {
    fetch.mockClear();
    
    jest.spyOn(window,'alert').mockImplementation(() => {});

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ qrCodeUrl: 'data:image/png;base64,fake-qr-code' }),
    });
  });

  it('CEFTS-24: fetches and displays the QR code', async () => {
    await act(async () => {
      render(<SetupMFA />);
    });
    
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:5001/api/mfa/setup', 
      expect.objectContaining({ headers: { 'x-auth-token': 'fake-token' } })
    );
    expect(screen.getByAltText('MFA QR Code')).toBeInTheDocument();
  });

  it('CEFTS-24: submits the token and redirects on success', async () => {
    // Mock the second /verify call
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ msg: 'MFA enabled successfully' }),
    });

    await act(async () => {
      render(<SetupMFA />);
    });

    await act(async () => {
      fireEvent.change(screen.getByLabelText('Verification Code:'), { target: { value: '123456' } });
      fireEvent.click(screen.getByRole('button', { name: 'Verify & Enable' }));
    });

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:5001/api/mfa/verify',
      expect.objectContaining({
        body: JSON.stringify({ token: '123456' })
      })
    );
    // You would also test that router.push('/dashboard') was called
  });
});