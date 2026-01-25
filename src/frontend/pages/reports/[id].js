// frontend/pages/reports/[id].js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import DonationChart from '../../components/DonationChart';

export default function ReportPage() {
    const router = useRouter();
    const { id } = router.query;
    const [reportData, setReportData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;
        const fetchReport = async () => {
            try {
                const res = await fetch(`http://localhost:5001/api/reports/${id}/visuals`);
                if (!res.ok) throw new Error('Failed to fetch report');
                const data = await res.json();

                // Defensive normalisation
                const safeData = {
                    pieChartData: Array.isArray(data.pieChartData) ? data.pieChartData : [],
                    topDonors: Array.isArray(data.topDonors) ? data.topDonors.map(d => ({
                        name: d.name || 'Anonymous',
                        amount: Number(d.amount || 0)
                    })) : []
                };

                setReportData(safeData);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchReport();
    }, [id]);

    if (error) return <p>Error: {error}</p>;
    if (!reportData) return <p>Loading reports...</p>;

    return (
        <div style={{ maxWidth: '900px', margin: 'auto', padding: '20px' }}>
            <h1>Visual Reports</h1>

            <div style={{ width: '60%', margin: '24px auto', background: 'white', padding: '20px', borderRadius: '8px' }}>
                <h3>Progress to Goal</h3>
                <DonationChart data={reportData.pieChartData} />
            </div>

            <div style={{ marginTop: '30px', background: 'white', padding: '20px', borderRadius: '8px' }}>
                <h3>Top Donors</h3>
                {reportData.topDonors.length === 0 ? (
                    <p>No donors yet.</p>
                ) : (
                    <ol>
                        {reportData.topDonors.map((donor, index) => (
                            <li key={index} style={{ fontSize: '1.1em', marginBottom: '10px' }}>
                                {donor.name} - ${Number(donor.amount || 0).toFixed(2)}
                            </li>
                        ))}
                    </ol>
                )}
            </div>
        </div>
    );
}
