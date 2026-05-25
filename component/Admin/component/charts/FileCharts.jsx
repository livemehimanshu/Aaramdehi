import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';

ChartJS.register(...registerables);

export const ActivityChart = () => {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    datasets: [
      {
        label: 'Downloads',
        data: [4000, 3000, 5000, 4500, 6000, 5500, 7000, 6500],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointRadius: 0,
      },
      {
        label: 'Uploads',
        data: [2000, 2500, 2200, 3000, 2800, 3500, 3200, 4000],
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointRadius: 0,
      }
    ]
  };

  const options = {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, border: { display: false } },
      y: { grid: { color: 'rgba(0,0,0,0.03)' }, border: { display: false } }
    }
  };

  return <Line data={data} options={options} />;
};