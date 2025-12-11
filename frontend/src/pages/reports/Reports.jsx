import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2';
import axiosClient from '../../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  Filler
);

export default function Reports() {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    usage: [],
    meals: [],
    waste: [],
    purchases: [],
    expiry: [],
    categories: []
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const kitchenId = user?.kitchenId;
      
      if (!kitchenId) {
        setLoading(false);
        return;
      }
      
      try {
        // Try to fetch real data from backend
        const [usageRes, mealsRes, wasteRes, purchasesRes, expiryRes, categoriesRes] = await Promise.all([
          axiosClient.get(`/analytics/usage/${kitchenId}`),
          axiosClient.get(`/analytics/meals/${kitchenId}`),
          axiosClient.get(`/analytics/waste/${kitchenId}`),
          axiosClient.get(`/analytics/purchases/${kitchenId}`),
          axiosClient.get(`/analytics/expiry/${kitchenId}`),
          axiosClient.get(`/analytics/categories/${kitchenId}`)
        ]);
        
        setAnalyticsData({
          usage: usageRes.data.usage || [],
          meals: mealsRes.data.meals || [],
          waste: wasteRes.data.waste || [],
          purchases: purchasesRes.data.purchases || [],
          expiry: expiryRes.data.expiry || [],
          categories: categoriesRes.data.categories || []
        });
      } catch (backendError) {
        // Fallback to mock data if backend is not available
        console.warn('Backend not available, using mock data');
        setAnalyticsData({
          usage: [
            { name: 'Onions', usage: 45 },
            { name: 'Tomatoes', usage: 38 },
            { name: 'Rice', usage: 32 },
            { name: 'Chicken', usage: 28 },
            { name: 'Milk', usage: 25 }
          ],
          meals: [
            { name: 'Breakfast', count: 25 },
            { name: 'Lunch', count: 35 },
            { name: 'Dinner', count: 30 },
            { name: 'Snacks', count: 10 }
          ],
          waste: [
            { month: 'Jan', expired: 5, consumed: 45 },
            { month: 'Feb', expired: 8, consumed: 42 },
            { month: 'Mar', expired: 3, consumed: 47 },
            { month: 'Apr', expired: 6, consumed: 44 },
            { month: 'May', expired: 4, consumed: 46 },
            { month: 'Jun', expired: 7, consumed: 43 }
          ],
          purchases: [
            { month: 'Jan', amount: 450 },
            { month: 'Feb', amount: 520 },
            { month: 'Mar', amount: 380 },
            { month: 'Apr', amount: 610 },
            { month: 'May', amount: 490 },
            { month: 'Jun', amount: 550 }
          ],
          expiry: [
            { name: 'Milk', daysLeft: 2, status: 'critical' },
            { name: 'Bread', daysLeft: 5, status: 'warning' },
            { name: 'Apples', daysLeft: 10, status: 'fresh' },
            { name: 'Yogurt', daysLeft: 0, status: 'expired' }
          ],
          categories: [
            { name: 'Vegetables', count: 15 },
            { name: 'Grains', count: 12 },
            { name: 'Dairy', count: 8 },
            { name: 'Meat', count: 6 },
            { name: 'Snacks', count: 4 }
          ]
        });
      }
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };



  // Chart configurations
  const usageChartData = {
    labels: analyticsData.usage.map(item => item.name),
    datasets: [{
      label: 'Usage Count',
      data: analyticsData.usage.map(item => item.usage),
      backgroundColor: 'rgba(34, 197, 94, 0.8)',
      borderColor: 'rgba(34, 197, 94, 1)',
      borderWidth: 1
    }]
  };

  const mealChartData = {
    labels: analyticsData.meals.map(item => item.name),
    datasets: [{
      data: analyticsData.meals.map(item => item.count),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const wasteChartData = {
    labels: analyticsData.waste.map(item => item.month),
    datasets: [
      {
        label: 'Consumed',
        data: analyticsData.waste.map(item => item.consumed),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        stack: 'Stack 0'
      },
      {
        label: 'Expired/Wasted',
        data: analyticsData.waste.map(item => item.expired),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        stack: 'Stack 0'
      }
    ]
  };

  const purchaseChartData = {
    labels: analyticsData.purchases.map(item => item.month),
    datasets: [{
      label: 'Monthly Spending ($)',
      data: analyticsData.purchases.map(item => item.amount),
      borderColor: 'rgba(34, 197, 94, 1)',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  const categoryChartData = {
    labels: analyticsData.categories.map(item => item.name),
    datasets: [{
      data: analyticsData.categories.map(item => item.count),
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(236, 72, 153, 0.8)'
      ]
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Kitchen Analytics & Reports</h1>
          <p className="text-gray-600 mt-2">Comprehensive insights into your kitchen management</p>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 1. Usage Analytics */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📊 Usage Analytics
            </h2>
            <p className="text-sm text-gray-600 mb-4">Top used ingredients in your kitchen</p>
            <div className="h-80">
              <Bar data={usageChartData} options={chartOptions} />
            </div>
          </div>

          {/* 2. Meal Analytics */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🍽️ Meal Analytics
            </h2>
            <p className="text-sm text-gray-600 mb-4">Distribution of meal categories</p>
            <div className="h-80">
              <Doughnut data={mealChartData} options={chartOptions} />
            </div>
          </div>

          {/* 3. Waste Analytics */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🗑️ Waste Analytics
            </h2>
            <p className="text-sm text-gray-600 mb-4">Monthly consumption vs waste comparison</p>
            <div className="h-80">
              <Bar data={wasteChartData} options={{...chartOptions, scales: { x: { stacked: true }, y: { stacked: true } }}} />
            </div>
          </div>

          {/* 4. Purchase Analytics */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              💰 Purchase Analytics
            </h2>
            <p className="text-sm text-gray-600 mb-4">Monthly spending trends and patterns</p>
            <div className="h-80">
              <Line data={purchaseChartData} options={chartOptions} />
            </div>
          </div>

          {/* 5. Inventory Expiry Heatmap */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              ⏰ Inventory Expiry Analytics
            </h2>
            <p className="text-sm text-gray-600 mb-4">Items by expiration status</p>
            <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto">
              {analyticsData.expiry.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <span className="font-medium">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{item.daysLeft} days</span>
                    <div className={`w-3 h-3 rounded-full ${
                      item.status === 'expired' ? 'bg-red-500' :
                      item.status === 'critical' ? 'bg-orange-500' :
                      item.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Category Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📂 Category Distribution
            </h2>
            <p className="text-sm text-gray-600 mb-4">How your pantry is divided by category</p>
            <div className="h-80">
              <Pie data={categoryChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{analyticsData.usage.length}</div>
            <div className="text-sm text-gray-600">Active Items</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{analyticsData.expiry.filter(i => i.status === 'fresh').length}</div>
            <div className="text-sm text-gray-600">Fresh Items</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{analyticsData.expiry.filter(i => i.status === 'warning').length}</div>
            <div className="text-sm text-gray-600">Expiring Soon</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{analyticsData.expiry.filter(i => i.status === 'expired').length}</div>
            <div className="text-sm text-gray-600">Expired Items</div>
          </div>
        </div>
      </div>
    </div>
  );
}