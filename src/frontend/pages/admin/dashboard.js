import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  
  const { user, token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/select-login');
      } else if (user.role !== 'Admin') {
        router.push('/'); 
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && token && user.role === 'Admin') {
      fetchUsers();
      fetchEvents();
    }
  }, [user, token]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/admin/users', {
        headers: { 'x-auth-token': token }
      });
      if (!res.ok) throw new Error('Could not fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/admin/events', {
        headers: { 'x-auth-token': token }
      });
      if (!res.ok) throw new Error('Could not fetch events');
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRevoke = async (userId) => {
    if (confirm('Are you sure you want to revoke this user\'s access?')) {
      try {
        const res = await fetch(`http://localhost:5001/api/admin/users/${userId}/revoke`, {
          method: 'POST',
          headers: { 'x-auth-token': token }
        });
        if (!res.ok) throw new Error('Failed to revoke access');
        fetchUsers(); 
      } catch (err) {
        alert(err.message);
      }
    }
  };

  if (loading || !user || user.role !== 'Admin') {
    return <p>Loading...</p>;
  }

  return (
    <div className="page-container">
      <h1>Admin Dashboard</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <div className="card">
        <h2>All Users ({users.length})</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  {u.isRevoked ? 
                    <span className="status-revoked">REVOKED</span> : 
                    <span className="status-active">Active</span>
                  }
                </td>
                <td>
                  {!u.isRevoked && u.role !== 'Admin' && (
                    <button onClick={() => handleRevoke(u._id)} className="button button-danger">
                      Revoke Access
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="card" style={{ marginTop: '30px' }}>
        <h2>All Events ({events.length})</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Event Title</th>
              <th>Organizer</th>
              <th>Status</th>
              <th>Goal</th>
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event._id}>
                <td>{event.title}</td>
                <td>{event.organizer ? event.organizer.email : 'N/A'}</td>
                <td>{event.status}</td>
                <td>${event.targetGoal.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        .table th,
        .table td {
          text-align: left;
          padding: 12px 15px;
          border-bottom: 1px solid #eee;
        }
        .table th {
          background-color: #f9f9f9;
          font-weight: 600;
        }
        .table tr:last-child td {
          border-bottom: none;
        }
        .status-active {
          color: #0a7a3d;
          font-weight: 600;
        }
        .status-revoked {
          color: #c91825;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}