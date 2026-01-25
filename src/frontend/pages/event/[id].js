import { useRouter } from 'next/router';
import { useState, useEffect, useCallback } from 'react';
import PledgeForm from '../../components/PledgeForm';
import ProgressBar from '../../components/ProgressBar';

export default function EventPage() {
    const router = useRouter();
    const { id } = router.query;
    const [event, setEvent] = useState(null);
    const [error, setError] = useState('');

    // Use useCallback to create a stable function for fetching
    const fetchEventData = useCallback(async () => {
        if (!id) return;
        try {
            // This is the public endpoint for a single event
            const res = await fetch(`http://localhost:5001/api/events/${id}`);
            if (!res.ok) throw new Error('Failed to fetch event data. It may not exist.');
            const data = await res.json();
            setEvent(data);
        } catch (err) {
            setError(err.message);
        }
    }, [id]);

    // Fetch data on initial page load
    useEffect(() => {
        fetchEventData();
    }, [fetchEventData]);

    if (error) return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>;
    if (!event) return <p style={{ textAlign: 'center' }}>Loading event...</p>;

    // --- THIS IS THE FIX ---
    // This UI now matches your create-event page's style
    return (
        <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px' }}>
            <h2 style={{ textAlign: 'center' }}>{event.title}</h2>
            <p>{event.description}</p>

            <hr style={{ margin: '20px 0' }} />

            <h3>Fundraising Progress</h3>
            <ProgressBar
                progress={event.progress}
                totalPledged={event.totalPledged}
                targetGoal={event.targetGoal}
            />

            {/* This is the Pledge Form from Sprint 1 */}
            <PledgeForm eventId={id} onPledgeSuccess={fetchEventData} />
        </div>
    );
    // -----------------------
}
