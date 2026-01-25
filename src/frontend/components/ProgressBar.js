import React from 'react';

// This component receives the data calculated by the backend
export default function ProgressBar({ progress, totalPledged, targetGoal }) {
  // Ensure progress is between 0 and 100
  const percent = Math.min(Math.max(progress, 0), 100).toFixed(2);

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{
        width: '100%',
        backgroundColor: '#e0e0e0',
        borderRadius: '5px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${percent}%`,
          backgroundColor: '#4caf50',
          height: '24px',
          borderRadius: '5px',
          textAlign: 'center',
          color: 'white',
          lineHeight: '24px',
          transition: 'width 0.3s ease-in-out'
        }}>
          {percent}%
        </div>
      </div>
      <p style={{ textAlign: 'center', margin: '5px 0 0' }}>
        <strong>Raised: ${totalPledged.toFixed(2)}</strong> / ${targetGoal.toFixed(2)}
      </p>
    </div>
  );
}