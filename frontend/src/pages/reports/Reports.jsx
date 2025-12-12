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
import { getFinancialSummary, getMostUsedIngredients, getCategoryBreakdown, getMoneyFlow, getExpiryAlertSuccess, getWasteStreak, getMonthlyProgress } from '../../services/dashboardApi';
import RightSidebar from '../../components/layout/RightSidebar';

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
  const [dashboardData, setDashboardData] = useState({
    financialSummary: null,
    mostUsedIngredients: [],
    categoryBreakdown: [],
    moneyFlow: null,
    expiryAlertSuccess: null,
    wasteStreak: null,
    monthlyProgress: null
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from backend, fallback to sample data
      try {
        const [financialRes, ingredientsRes, categoryRes, moneyFlowRes, expiryRes, streakRes, progressRes] = await Promise.all([
          getFinancialSummary(),
          getMostUsedIngredients(),
          getCategoryBreakdown(),
          getMoneyFlow(),
          getExpiryAlertSuccess(),
          getWasteStreak(),
          getMonthlyProgress()
        ]);
        
        setDashboardData({
          financialSummary: financialRes,
          mostUsedIngredients: ingredientsRes.ingredients || [],
          categoryBreakdown: categoryRes.categories || [],
          moneyFlow: moneyFlowRes,
          expiryAlertSuccess: expiryRes,
          wasteStreak: streakRes,
          monthlyProgress: progressRes
        });
      } catch (backendError) {
        console.warn('Backend not available, using sample data');
        // Fallback to empty data when backend unavailable
        setDashboardData({
          financialSummary: null,
          mostUsedIngredients: [],
          categoryBreakdown: [],
          moneyFlow: null,
          expiryAlertSuccess: null,
          wasteStreak: null,
          monthlyProgress: null
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart configurations
  const ingredientsChartData = {
    labels: dashboardData.mostUsedIngredients.map(item => item.itemName),
    datasets: [{
      label: 'Total Consumed',
      data: dashboardData.mostUsedIngredients.map(item => parseFloat(item.totalConsumed)),
      backgroundColor: 'rgba(34, 197, 94, 0.8)',
      borderColor: 'rgba(34, 197, 94, 1)',
      borderWidth: 1
    }]
  };

  const categoryChartData = {
    labels: dashboardData.categoryBreakdown.map(item => item.categoryName),
    datasets: [{
      data: dashboardData.categoryBreakdown.map(item => parseFloat(item.totalValue)),
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

  const categoryCountChartData = {
    labels: dashboardData.categoryBreakdown.map(item => item.categoryName),
    datasets: [{
      label: 'Item Count',
      data: dashboardData.categoryBreakdown.map(item => item.itemCount),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1
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
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Kitchen Analytics & Reports</h1>
            <p className="text-gray-600 mt-2">Real-time insights from your pantry data</p>
          </div>

          {/* Analytics Sections */}
          <div className="space-y-6">
            {/* 1. Expiry Alert Success Dashboard */}
            {dashboardData.expiryAlertSuccess && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">🚨 Expiry Alert Success Rate</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{dashboardData.expiryAlertSuccess.totalAlerts || 0}</div>
                    <div className="text-sm text-gray-600">Total Alerts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{dashboardData.expiryAlertSuccess.itemsSaved || 0}</div>
                    <div className="text-sm text-gray-600">Items Saved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{dashboardData.expiryAlertSuccess.itemsWasted || 0}</div>
                    <div className="text-sm text-gray-600">Items Wasted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{(dashboardData.expiryAlertSuccess.successRate || 0).toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {dashboardData.expiryAlertSuccess.alertItems?.slice(0, 10).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border-b last:border-b-0">
                      <span className="font-medium">{item.itemName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">₹{item.value || 0}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          item.status === 'SAVED' ? 'bg-green-100 text-green-800' :
                          item.status === 'WASTED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Most Used Ingredients Enhanced */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Top 10 Most Used Ingredients</h2>
              {dashboardData.mostUsedIngredients.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.mostUsedIngredients.slice(0, 10).map((item, index) => {
                    const maxUsage = Math.max(...dashboardData.mostUsedIngredients.map(i => parseFloat(i.totalConsumed)));
                    const percentage = maxUsage > 0 ? (parseFloat(item.totalConsumed || 0) / maxUsage) * 100 : 0;
                    
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{item.itemName || 'Unknown'}</span>
                            <span className="text-sm text-gray-600">{item.consumptionCount || 0} times ({item.totalConsumed || 0} {item.unit || ''})</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">No consumption data available</div>
              )}
            </div>

            {/* 3. Waste-Free Streak Tracker */}
            {dashboardData.wasteStreak && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">🔥 Waste-Free Streak</h2>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {dashboardData.wasteStreak.currentStreak || 0} Days
                    {(dashboardData.wasteStreak.currentStreak || 0) > 0 && ' 🔥'.repeat(Math.min(Math.floor((dashboardData.wasteStreak.currentStreak || 0) / 7) + 1, 5))}
                  </div>
                  <div className="text-gray-600">Current Streak</div>
                  <div className="mt-4">
                    <div className="text-sm text-gray-600 mb-2">
                      {dashboardData.wasteStreak.daysToNextMilestone || 0} days to {dashboardData.wasteStreak.nextMilestone || 7}-day milestone
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-green-600 h-3 rounded-full" 
                        style={{ 
                          width: `${((dashboardData.wasteStreak.currentStreak || 0) / (dashboardData.wasteStreak.nextMilestone || 1)) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Recent Wins:</h3>
                  {dashboardData.wasteStreak.recentWins?.slice(0, 5).map((win, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border-b last:border-b-0">
                      <div>
                        <div className="font-medium">{win.itemName || 'Unknown'}</div>
                        <div className="text-sm text-gray-600">{win.action || 'Action taken'}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">₹{win.valueSaved || 0}</div>
                        <div className="text-xs text-gray-500">{new Date(win.date).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Monthly Progress Timeline */}
            {dashboardData.monthlyProgress && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">📈 Monthly Improvement Timeline</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Progress Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Saved:</span>
                        <span className="font-bold text-green-600">₹{dashboardData.monthlyProgress.totalSaved || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Overall Improvement:</span>
                        <span className="font-bold text-green-600">{(dashboardData.monthlyProgress.overallImprovement || 0).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Monthly Breakdown</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {dashboardData.monthlyProgress.monthlyData?.map((month, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="font-medium">{month.month || 'Unknown'}</span>
                          <div className="text-right">
                            <div className="font-bold">₹{month.wasteValue || 0}</div>
                            <div className={`text-xs ${
                              (month.improvementPercentage || 0) > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {(month.improvementPercentage || 0) > 0 ? '+' : ''}{(month.improvementPercentage || 0).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Sidebar */}
        <RightSidebar />
      </div>
    </div>
  );
}