import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function SetupMFA() {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // 1. Fetch the QR code from the backend
  useEffect(() => {
    const getQrCode = async () => {
      const userToken = localStorage.getItem('token'); // Assumes user is logged in
      if (!userToken) {
        setError('You must be logged in to set up MFA.');
        return;
      }
      try {
        const res = await fetch('http://localhost:5001/api/mfa/setup', {
          method: 'POST',
          headers: { 'x-auth-token': userToken },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || 'Failed to get QR code');
        setQrCodeUrl(data.qrCodeUrl);
      } catch (err) {
        setError(err.message);
      }
    };
    getQrCode();
  }, []);

  // 2. Handle verification
  const handleSubmit = async (e) => {
    e.preventDefault();
    const userToken = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5001/api/mfa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': userToken,
        },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Verification failed');

      alert('MFA Enabled Successfully!');
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px' }}>
      <h2>Set Up Multi-Factor Authentication</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>1. Scan this QR code with your authenticator app (Google Auth, Authy, etc.)</p>
      {qrCodeUrl ? (
        <Image
          src={qrCodeUrl}
          alt="MFA QR Code"
          width={200}
          height={200}
        />
      ) : (
        <p>Loading QR Code...</p>
      )}
      <p>2. Enter the 6-digit code from your app to verify.</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="token" style={{ display: 'block', margin: '10px 0' }}>Verification Code:</label>
        <input
          id="token"
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="123456"
          maxLength="6"
          required
        />
        <button type="submit" style={{ marginLeft: '10px' }}>Verify & Enable</button>
      </form>
    </div>
  );
}