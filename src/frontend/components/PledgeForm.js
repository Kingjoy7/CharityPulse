import { useState } from 'react';

export default function PledgeForm({ eventId, onPledgeSuccess }) {
    const [formData, setFormData] = useState({
        donorName: '',
        donorEmail: '',
        amount: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (parseFloat(formData.amount) <= 0) {
            setError('Pledge amount must be greater than 0');
            return;
        }

        try {
            const res = await fetch('http://localhost:5001/api/pledges', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    eventId,
                    amount: parseFloat(formData.amount)
                })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.msg || 'Pledge failed');
            }

            setMessage('Thank you for your pledge!');
            setFormData({ donorName: '', donorEmail: '', amount: '' });

            if (onPledgeSuccess) {
                onPledgeSuccess();
            }

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '5px' }}>
            <h3>Make a Pledge</h3>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div style={{ marginBottom: '10px' }}>
                <label>Name:</label>
                <input name="donorName" value={formData.donorName} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label>Email:</label>
                <input name="donorEmail" type="email" value={formData.donorEmail} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
            </div>
            <div style={{ marginBottom: '10px' }}>
                <label>Amount ($):</label>
                <input name="amount" type="number" step="0.01" min="0.01" value={formData.amount} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
            </div>
            <button type="submit">Pledge Now</button>
        </form>
    );
}