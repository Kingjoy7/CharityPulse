import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function CloseEventButton({ eventId, onEventClosed }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleClose = async () => {
    if (!confirm('Are you sure you want to close this event? No more pledges will be accepted.')) return;

    try {
      if (!token) throw new Error('You are not authenticated.');

      setLoading(true);

      const res = await fetch(`http://localhost:5001/api/events/${eventId}/close`, {
        method: 'POST',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.msg || 'Failed to close event');
      }

      if (onEventClosed) onEventClosed();
    } catch (err) {
      alert(err.message || 'Error closing event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClose}
      className="btn btn-danger"
      disabled={loading}
      style={{ minWidth: 110 }}
    >
      {loading ? 'Closing...' : 'Close Event'}
    </button>
  );
}
