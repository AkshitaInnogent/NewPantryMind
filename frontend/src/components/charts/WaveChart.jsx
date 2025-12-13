import { Line } from 'react-chartjs-2';

const WaveChart = ({ data }) => {
  const chartData = {
    labels: data.map(month => month.month.substring(0, 3)),
    datasets: [
      {
        label: 'Saved',
        data: data.map(month => {
          const wasted = month.totalWasted || month.wasteValue || 0;
          const spent = month.totalSpent || (wasted > 0 ? wasted * 5 : 0);
          return Math.round(spent > 0 ? spent * 0.1 : 0);
        }),
        backgroundColor: 'rgba(134, 239, 172, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3
      },
      {
        label: 'Wasted',
        data: data.map(month => month.totalWasted || month.wasteValue || 0),
        backgroundColor: 'rgba(252, 165, 165, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3
      },
      {
        label: 'Consumed',
        data: data.map(month => {
          const wasted = month.totalWasted || month.wasteValue || 0;
          const spent = month.totalSpent || (wasted > 0 ? wasted * 5 : 0);
          return Math.round(spent > 0 ? spent - wasted - (spent * 0.1) : 0);
        }),
        backgroundColor: 'rgba(147, 197, 253, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    hover: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        titleColor: '#1f2937',
        bodyColor: '#374151',
        borderColor: '#d1d5db',
        borderWidth: 2,
        cornerRadius: 12,
        padding: 16,
        displayColors: true,
        callbacks: {
          title: (context) => `${data[context[0].dataIndex]?.month} 2024`,
          beforeBody: (context) => {
            const monthData = data[context[0]?.dataIndex];
            if (monthData) {
              const wasted = monthData.totalWasted || monthData.wasteValue || 0;
              const spent = monthData.totalSpent || (wasted > 0 ? wasted * 5 : 0);
              const consumed = spent > 0 ? spent - wasted - (spent * 0.1) : 0;
              const saved = spent > 0 ? spent * 0.1 : 0;
              const total = consumed + saved + wasted;
              const efficiency = total > 0 ? Math.round(((consumed + saved) / total) * 100) : 0;
              return [`Total Spent: ₹${total}`, `Efficiency: ${efficiency}%`];
            }
            return [];
          },
          label: (context) => {
            const value = context.parsed.y;
            const total = context.chart.data.datasets.reduce((sum, dataset) => {
              return sum + (dataset.data[context.dataIndex] || 0);
            }, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            const label = context.dataset.label.replace(/[💚💰🗑️]/g, '').trim();
            return `${label}: ₹${value} (${percentage}%)`;
          },
          afterBody: () => ['']
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { weight: 500 } }
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.1)' },
        ticks: { 
          color: '#64748b',
          callback: (value) => `₹${value}`
        }
      }
    }
  };

  return (
    <div className="w-full h-80">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default WaveChart;