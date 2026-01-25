import { useState, useEffect } from 'react';
import Link from 'next/link';
import EventCard from '../components/EventCard';

export default function HomePage() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('http://localhost:5001/api/events'); 
        if (!res.ok) throw new Error('Failed to fetch events');
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div style={{ maxWidth: '960px', margin: '30px auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', fontSize: '2rem' }}>Active Fundraisers</h2>
      <p style={{ textAlign: 'center', marginBottom: '30px' }}>Browse and support the causes you care about.</p>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {events.length > 0 ? (
          events.map(event => (
            <EventCard key={event._id} event={event} />
          ))
        ) : (
          <p>No active fundraisers found. Check back soon!</p>
        )}
      </div>
    </div>
  );
}