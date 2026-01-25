import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [title, setTitle] = useState('Register');
  const [role, setRole] = useState('User'); // Default to 'User'
  const router = useRouter();

  useEffect(() => {
    // --- THIS IS THE FIX ---
    // Read the capitalized role from the URL query
    if (router.query.role === 'Organizer') {
        setTitle('Register as an Organizer');
        setRole('Organizer'); // <-- Must be Capitalized
    } else if (router.query.role === 'Admin') {
        setTitle('Register as an Admin');
        setRole('Admin'); // <-- Must be Capitalized
    } else {
        setTitle('Register as a User');
        setRole('User'); // <-- Must be Capitalized
    }
    // -----------------------
  }, [router.query.role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Pass the correct capitalized role to the backend
        body: JSON.stringify({ email, password, role: role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Registration failed');

      // --- THIS IS THE FIX ---
      // Redirect to login page, passing the capitalized role
      router.push(`/login?role=${role}`);
      // -----------------------

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>{title}</h2> {/* <-- Dynamic title */}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
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
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px' }} className="button button-primary">Register</button>
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </form>
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        {/* --- THIS IS THE FIX --- */}
        {/* Make the Login link dynamic and pass the capitalized role */}
        <Link href={`/login?role=${role}`} className="button-link button-secondary">
          Already have an account? Sign In
        </Link>
        {/* ----------------------- */}
      </div>
    </div>
  );
}