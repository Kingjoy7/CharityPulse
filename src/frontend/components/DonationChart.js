import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DonationChart({ data }) {
    if (!data || !Array.isArray(data)) return null;

    // Convert the backend array format → Chart.js expected format
    const labels = data.map(item => item.label || "Unknown");
    const values = data.map(item => Number(item.value || 0));

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: "Amount",
                data: values,
                backgroundColor: [
                    "#4caf50",  // green (raised)
                    "#cccccc",  // grey (remaining)
                ],
                borderColor: "#ffffff",
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: "Fundraising Progress",
            },
        },
    };

    return <Pie data={chartData} options={options} />;
}
