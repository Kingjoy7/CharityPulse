import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function EventSummary() {
  const router = useRouter();
  const { id } = router.query;
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchSummary = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/reports/${id}/summary`);
        if (!res.ok) throw new Error('Failed to fetch summary');
        const data = await res.json();

        const safe = {
          title: data.title || 'Untitled Event',
          status: data.status || 'Unknown',
          description: data.description || '',
          progress: typeof data.progress === 'number' ? data.progress : 0,
          totalPledged: Number(data.totalPledged || 0),
          targetGoal: Number(data.targetGoal || 0),
          pledgeCount: Number(data.pledgeCount || 0),
        };

        setSummary(safe);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchSummary();
  }, [id]);

  if (error) return <p>Error: {error}</p>;
  if (!summary) return <p>Loading summary...</p>;

  return (
    <div style={{ maxWidth: '700px', margin: 'auto', padding: '20px' }}>
      <h1>Event Summary</h1>
      <Link href="/organiser/dashboard">Back to Dashboard</Link>
      
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
        <h2>{summary.title}</h2>
        <p><strong>Status:</strong> {summary.status}</p>
        <p><strong>Description:</strong> {summary.description}</p>
        <hr style={{ border: 'none', borderTop: '1px solid #eee' }} />
        <h3>Fundraising Stats</h3>
        <p><strong>Progress:</strong> {Number(summary.progress || 0).toFixed(2)}%</p>
        <p><strong>Total Raised:</strong> ${Number(summary.totalPledged || 0).toFixed(2)}</p>
        <p><strong>Target Goal:</strong> ${Number(summary.targetGoal || 0).toFixed(2)}</p>
        <p><strong>Total Pledges:</strong> {Number(summary.pledgeCount || 0)}</p>
      </div>
    </div>
  );
}
