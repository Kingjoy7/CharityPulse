import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';

export default function CreateEvent() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        targetGoal: '',
        endDate: ''
    });
    const [error, setError] = useState('');
    const router = useRouter();
    
    const { user, token, loading } = useAuth(); 

    useEffect(() => {
        if (!loading) { 
            if (!user) {
                router.push('/select-login');
            } 
            else if (user.role !== 'Organizer' && user.role !== 'Admin') {
            router.push('/'); 
            }
        }
    }, [user, loading, router]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!token) {
            setError('You are not authenticated. Please log in again.');
            return;
        }

        try {
            const res = await fetch('http://localhost:5001/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token 
                },
                body: JSON.stringify({
                    ...formData,
                    targetGoal: parseFloat(formData.targetGoal)
                }),
            });

            if (!res.ok) {
                const data = await res.json(); 
                throw new Error(data.msg || 'Failed to create event. Please check all fields.');
            }

            router.push('/organiser/dashboard');
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading || !user || (user.role !== 'Organizer' && user.role !== 'Admin')) {
        return <p>Loading...</p>;
    }

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: 'auto', padding: '20px' }}>
            <h2>Create New Fundraising Event</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div style={{ marginBottom: '10px' }}>
                <label htmlFor="title">Event Title:</label>
                <input id="title" name="title" value={formData.title} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label htmlFor="description">Description:</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} required style={{ width: '100%', padding: '8px', minHeight: '100px' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label htmlFor="targetGoal">Target Goal ($):</label>
                <input id="targetGoal" name="targetGoal" type="number" value={formData.targetGoal} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label htmlFor="endDate">End Date (Optional):</label>
                <input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleChange} style={{ width: '100%', padding: '8px' }} />
            </div>

            <button type="submit" style={{ width: '100%', padding: '10px' }}>Create Event</button>
        </form>
    );
}