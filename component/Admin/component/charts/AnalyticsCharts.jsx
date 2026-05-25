import React from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';

ChartJS.register(...registerables);

export const DeptChart = () => {
  const data = {
    labels: ['Furniture', 'Lighting', 'Decor', 'Bedding'],
    datasets: [{
      data: [40, 25, 20, 15],
      backgroundColor: ['#00E5A0', '#38BDF8', '#FFB547', '#FF6B8A'],
      borderWidth: 0,
      cutout: '70%',
    }]
  };

  return <Doughnut data={data} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />;
};

export const SalesChart = () => {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{
      label: 'Sales',
      data: [30, 45, 35, 60, 50],
      borderColor: '#00E5A0',
      tension: 0.4,
      fill: true,
      backgroundColor: 'rgba(0, 229, 160, 0.05)',
    }]
  };

  return <Line data={data} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />;
};