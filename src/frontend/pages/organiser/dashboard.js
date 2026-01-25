// frontend/pages/organiser/dashboard.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import CloseEventButton from '../../components/CloseEventButton';
import ProgressBar from '../../components/ProgressBar';

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [loadingEvents, setLoadingEvents] = useState(false);
  const { user, token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) router.push('/select-login');
      else if (user.role !== 'Organizer' && user.role !== 'Admin') router.push('/');
    }
  }, [user, loading, router]);

  const fetchEvents = async () => {
    try {
      setError('');
      setLoadingEvents(true);

      if (!token) {
        throw new Error('No auth token found. Please log in.');
      }

      const res = await fetch('http://localhost:5001/api/events/my-events', {
        headers: { 'x-auth-token': token },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(text || 'Failed to fetch your events.');
      }

      const data = await res.json();
      setEvents(data);
    } catch (err) {
      setError(err.message || 'Unknown error while fetching events.');
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    if (user && token) fetchEvents();
  }, [user, token]);

  const handleDelete = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;

    try {
      if (!token) throw new Error('You are not authenticated.');

      const res = await fetch(`http://localhost:5001/api/events/${eventId}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.msg || 'Failed to delete event');
      }

      await fetchEvents();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleExport = async (eventId) => {
    try {
      if (!token) throw new Error('You are not authenticated.');

      const res = await fetch(`http://localhost:5001/api/reports/${eventId}/csv`, {
        headers: { 'x-auth-token': token }
      });

      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(text || 'Failed to download CSV');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `pledges-${eventId}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading || !user) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div className="page-container" style={{ padding: '20px 24px' }}>
      <h1 style={{ marginBottom: 8 }}>Organizer Dashboard</h1>

      <div style={{ marginBottom: 18 }}>
        <button
          className="btn btn-primary"
          onClick={() => router.push('/organiser/create-event')}
        >
          Create New Event
        </button>
      </div>

      <h2 style={{ marginTop: 10 }}>Your Events</h2>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {loadingEvents && <p>Loading events...</p>}

      <div className="events-grid" style={{ marginTop: 18 }}>
        {events.length === 0 && !loadingEvents ? (
          <div className="empty-state-card">
            <p>You have not created any events yet.</p>
          </div>
        ) : null}

        {events.map((event) => (
          <div key={event._id} className="event-card">
            <div className="event-card-head">
              <h3 className="event-title">{event.title}</h3>
              <span className={`badge ${event.status === 'Active' ? 'badge-active' : 'badge-closed'}`}>
                {event.status}
              </span>
            </div>

            <p className="event-desc">{event.description?.substring(0, 160)}</p>

            <div className="event-meta">
              <div><strong>Goal:</strong> ${Number(event.targetGoal || 0).toLocaleString()}</div>
              <div><strong>Raised:</strong> ${Number(event.totalPledged || 0).toLocaleString()}</div>
            </div>

            <ProgressBar
              progress={event.progress || 0}
              totalPledged={event.totalPledged || 0}
              targetGoal={event.targetGoal || 0}
            />

            <div className="event-actions">
              <button className="btn btn-secondary" onClick={() => router.push(`/organiser/event/edit/${event._id}`)}>Edit</button>

              <button className="btn btn-secondary" onClick={() => router.push(`/reports/${event._id}`)}>Reports</button>

              <button className="btn btn-secondary" onClick={() => router.push(`/reports/summary/${event._id}`)}>Summary</button>

              <button className="btn btn-ghost" onClick={() => handleExport(event._id)}>Export CSV</button>

              <button className="btn btn-danger" onClick={() => handleDelete(event._id)}>Delete</button>

              <CloseEventButton eventId={event._id} onEventClosed={fetchEvents} />
            </div>
          </div>
        ))}
      </div>
      <style jsx>{`
        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 18px;
        }
        .event-card {
          background: #fff;
          border-radius: 10px;
          padding: 18px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.04);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .event-card-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }
        .event-title { margin: 0; font-size: 1.15rem; }
        .badge { padding: 6px 8px; border-radius: 6px; font-weight: 700; font-size: 0.8rem; }
        .badge-active { background: #e6fff1; color: #0a7a3d; border: 1px solid #b6f0c9; }
        .badge-closed { background: #fff6f6; color: #9b2b2b; border: 1px solid #f1c6c6; }
        .event-desc { color: #555; margin: 0; min-height: 48px; }
        .event-meta { display:flex; justify-content:space-between; gap:12px; font-size: 0.95rem; color:#333; }
        .event-actions { display:flex; gap:10px; flex-wrap:wrap; margin-top:6px; }
        .empty-state-card {
          grid-column: 1 / -1;
          background: #fff;
          padding: 28px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
        }

        @media (max-width: 640px) {
          .event-meta { flex-direction: column; gap:6px; }
          .event-actions { justify-content: flex-start; }
        }
      `}</style>
    </div>
  );
}
