import Link from 'next/link';
import { useRouter } from 'next/router';

export default function SelectLogin() {
    const router = useRouter();

    const containerStyle = {
        maxWidth: '600px',
        margin: '50px auto',
        padding: '40px',
        textAlign: 'center',
        border: '1px solid #eee',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
    };
    
    const buttonContainerStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        marginTop: '30px'
    };

    const roleButtonStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        borderRadius: '8px',
        border: '2px solid #0070f3',
        background: '#fff',
        color: '#0070f3',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    };

    const addHover = (e) => {
        e.currentTarget.style.background = '#0070f3';
        e.currentTarget.style.color = '#fff';
    };

    const removeHover = (e) => {
        e.currentTarget.style.background = '#fff';
        e.currentTarget.style.color = '#0070f3';
    };

    return (
        <div style={containerStyle}>
            <h2>Welcome to CharityPulse</h2>
            <p>Please select your role to continue.</p>

            <div style={buttonContainerStyle}>
                <button
                    style={roleButtonStyle}
                    onClick={() => router.push('/login?role=User')}
                    onMouseOver={addHover}
                    onMouseOut={removeHover}
                >
                    <span>User</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 'normal', marginTop: '5px' }}>(I want to browse and pledge)</span>
                </button>

                <button
                    style={roleButtonStyle}
                    onClick={() => router.push('/login?role=Organizer')}
                    onMouseOver={addHover}
                    onMouseOut={removeHover}
                >
                    <span>Organizer</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 'normal', marginTop: '5px' }}>(I want to create events)</span>
                </button>

                <button
                    style={roleButtonStyle}
                    onClick={() => router.push('/login?role=Admin')}
                    onMouseOver={addHover}
                    onMouseOut={removeHover}
                >
                    <span>Admin</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 'normal', marginTop: '5px' }}>(Admin)</span>
                </button>
            </div>
        </div>
    );
}