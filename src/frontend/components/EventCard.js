import Link from 'next/link';
import ProgressBar from './ProgressBar'; // Assuming you want to show progress

export default function EventCard({ event }) {
  
  // --- THIS IS THE FIX FOR FAILURE 1 ---
  // Only add '...' if the description is actually longer than 100 chars
  const description = event.description.length > 100 
    ? event.description.substring(0, 100) + '...' 
    : event.description;
  // ------------------------------------

  return (
    <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
      <div>
        <h3>{event.title}</h3>
        <p>{description}</p>
        <p><strong>Goal:</strong> ${event.targetGoal.toLocaleString()}</p>
        {/* We can add the ProgressBar component here. The test is looking for it. */}
        <ProgressBar
          progress={event.progress}
          totalPledged={event.totalPledged}
          targetGoal={event.targetGoal}
        />
      </div>
      
      {/* --- THIS IS THE FIX FOR FAILURE 2 --- */}
      {/* The test expects a link named "View & Pledge" (from your index.js) */}
      <Link href={`/event/${event._id}`} style={{
        display: 'block',
        textAlign: 'center',
        padding: '10px',
        backgroundColor: '#0070f3',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '5px',
        marginTop: '15px'
      }}>
        View & Pledge
      </Link>
      {/* ------------------------------------ */}
    </div>
  );
}
