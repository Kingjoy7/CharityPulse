import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login2FA() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { userId } = router.query;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      setError('No user ID found. Please log in again.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5001/api/auth/login/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, token }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Login failed');

      localStorage.setItem('token', data.token);
      router.push('/dashboard');

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
      <h2>Enter 2FA Code</h2>
      <p>Enter the 6-digit code from your authenticator app.</p>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="token">Authentication Code:</label>
          <input
            id="token"
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            maxLength="6"
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px' }}>Log In</button>
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </form>
    </div>
  );
}