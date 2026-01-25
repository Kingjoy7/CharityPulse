import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [title, setTitle] = useState('Login');
  const [role, setRole] = useState('User');

  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    const r = router.query.role;
    if (r === 'Organizer') {
      setTitle('Organizer Login');
      setRole('Organizer');
    } else if (r === 'Admin') {
      setTitle('Admin Login');
      setRole('Admin');
    } else {
      setTitle('User Login');
      setRole('User');
    }
  }, [router.query.role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Login failed');

      if (data.mfaRequired) {
        router.push(`/login-2fa?userId=${data.userId}`);
      } else {
        login(data.token);
      }

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{
      maxWidth: '400px', margin: '50px auto', padding: '20px',
      border: '1px solid #ddd', borderRadius: '8px'
    }}>
      <h2>{title}</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <button type="submit" style={{ width: '100%', padding: '10px' }} className="button button-primary">
          Login
        </button>

        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </form>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <Link href={`/register?role=${role}`} className="button-link button-primary">
          Don&apos;t have an account? Register
        </Link>
        <br />
        <Link href="/forgot-password" className="button-link button-secondary">
          Forgot Password?
        </Link>
        <br />
        <Link href="/setup-mfa" className="button-link button-secondary">
          Set up MFA
        </Link>
      </div>
    </div>
  );
}
