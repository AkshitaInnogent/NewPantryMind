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
  RadialLinearScale,
} from 'chart.js';
import { Bar, Doughnut, Line, Pie, PolarArea, Radar } from 'react-chartjs-2';
import WaveChart from '../../components/charts/WaveChart';
import { getFinancialSummary, getMostUsedIngredients, getCategoryBreakdown, getMoneyFlow, getExpiryAlertSuccess, getWasteStreak, getMonthlyProgress } from '../../services/dashboardApi';
import RightSidebar from '../../components/layout/RightSidebar';
import { BackButton } from '../../components/ui';
import { FaTrash, FaExclamationTriangle, FaChartBar, FaUtensils, FaChartPie } from 'react-icons/fa';
import './Reports.css';

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
  Filler,
  RadialLinearScale
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
        setDashboardData({
          financialSummary: null,
          mostUsedIngredients: [],
          categoryBreakdown: [],
          moneyFlow: null,
          expiryAlertSuccess: { itemsWasted: 0, itemsSaved: 0, totalAlerts: 0, successRate: 0 },
          wasteStreak: null,
          monthlyProgress: {
            monthlyData: [
              { month: 'NOVEMBER', wasteValue: 800 },
              { month: 'DECEMBER', wasteValue: 1200 }
            ]
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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
        'rgba(99, 102, 241, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(168, 85, 247, 0.8)'
      ],
      borderWidth: 3,
      borderColor: 'white'
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-2xl p-12 border border-green-200">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto"></div>
          <h3 className="mt-6 text-xl font-bold text-gray-900">Loading Analytics Dashboard</h3>
          <p className="mt-2 text-gray-700">Preparing your kitchen intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4">
            <BackButton />
          </div>
          <div className="mb-8 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  PantryMind Analytics
                </h1>

              </div>

            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-red-600">
                    {dashboardData.expiryAlertSuccess?.itemsWasted || 0}
                  </div>
                  <div className="text-gray-700 font-medium">Items Wasted</div>
                  <div className="text-xs text-red-600 mt-1 font-semibold">
                    {dashboardData.expiryAlertSuccess?.itemsWasted > 0 ? 'Needs Attention' : 'Excellent!'}
                  </div>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <FaTrash className="text-red-600 text-xl" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-green-600">
                    ₹{((dashboardData.expiryAlertSuccess?.itemsSaved || 0) * 50) || 0}
                  </div>
                  <div className="text-gray-700 font-medium">Money Saved</div>
                  <div className="text-xs text-green-600 mt-1 font-semibold">
                    Smart Alerts Working
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xl font-bold">₹</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-green-600">
                    {(dashboardData.expiryAlertSuccess?.successRate || 0).toFixed(1)}%
                  </div>
                  <div className="text-gray-700 font-medium">Success Rate</div>
                  <div className="text-xs text-green-600 mt-1 font-semibold">
                    Performance Metric
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <FaChartBar className="text-green-600 text-xl" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-200 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3"><FaChartBar /> Monthly Kitchen Report</h2>
              <div className="bg-gradient-to-r from-green-100 to-green-200 px-4 py-2 rounded-full">
                <span className="text-gray-800 font-semibold text-sm">Wave Analysis</span>
              </div>
            </div>
            
            {(() => {
              const monthlyData = dashboardData.monthlyProgress?.monthlyData || [];
              
              if (monthlyData.length === 0) {
                return (
                  <div className="text-center text-gray-600 py-16">
                    <div className="text-6xl mb-4">📈</div>
                    <div className="text-xl font-semibold">No monthly data available</div>
                    <div className="text-sm mt-2">Monthly reports will appear as you use PantryMind</div>
                  </div>
                );
              }
              
              return (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-green-50 to-white rounded-2xl p-6 border border-green-200">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Monthly Spending Flow</h3>
                      <p className="text-gray-600 text-sm">Stacked area visualization showing consumption, savings, and waste patterns</p>
                    </div>
                    
                    <WaveChart data={monthlyData} />
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {dashboardData.expiryAlertSuccess && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-200">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><FaExclamationTriangle /> Expiry Alert Success Rate</h2>
                    <div className="bg-green-100 px-3 py-1 rounded-full">
                      <span className="text-green-700 font-semibold text-sm">Live Data</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">Shows how effective our alerts are at preventing food waste</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {dashboardData.expiryAlertSuccess.itemsSaved || 0}
                    </div>
                    <div className="text-sm text-green-700">Items Saved</div>
                    <div className="text-xs text-green-600 mt-1">
                      ₹{((dashboardData.expiryAlertSuccess.itemsSaved || 0) * 50)} saved
                    </div>
                  </div>
                  
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-red-600">
                      {dashboardData.expiryAlertSuccess.itemsWasted || 0}
                    </div>
                    <div className="text-sm text-red-700">Items Wasted</div>
                    <div className="text-xs text-red-600 mt-1">
                      ₹{((dashboardData.expiryAlertSuccess.itemsWasted || 0) * 50)} lost
                    </div>
                  </div>
                </div>
                
                <div style={{height: '200px'}}>
                  <Doughnut 
                    data={{
                      labels: ['Items Saved', 'Items Wasted'],
                      datasets: [{
                        data: [
                          dashboardData.expiryAlertSuccess.itemsSaved || 0,
                          dashboardData.expiryAlertSuccess.itemsWasted || 0
                        ],
                        backgroundColor: ['#16a34a', '#dc2626'],
                        borderWidth: 0,
                        cutout: '70%'
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            label: (context) => {
                              const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                              const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                              return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}
            
            {dashboardData.categoryBreakdown.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><FaChartPie /> Category Distribution</h2>
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full border border-purple-200">
                    <span className="text-purple-700 font-bold text-sm">Spending Breakdown</span>
                  </div>
                </div>
                
                <div style={{height: '300px'}}>
                  <PolarArea 
                    data={categoryChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            padding: 20,
                            usePointStyle: true
                          }
                        },
                        tooltip: {
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          callbacks: {
                            label: (context) => {
                              const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                              const percentage = ((context.parsed / total) * 100).toFixed(1);
                              return [`Amount: ₹${context.parsed}`, `Share: ${percentage}%`];
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-200 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><FaUtensils /> Top Ingredients Usage</h2>
              <div className="bg-green-100 px-3 py-1 rounded-full">
                <span className="text-green-700 font-semibold text-sm">Consumption Analytics</span>
              </div>
            </div>
            
            {dashboardData.mostUsedIngredients.length > 0 ? (
              <div style={{height: '400px'}}>
                <Bar 
                  data={ingredientsChartData}
                  options={chartOptions}
                />
              </div>
            ) : (
              <div className="text-center text-gray-600 py-16">
                <div className="text-6xl mb-4">📈</div>
                <div className="text-xl font-semibold">No consumption data available</div>
                <div className="text-sm mt-2">Start tracking your ingredient usage to see analytics</div>
              </div>
            )}
          </div>
        </div>
        
        <div className="hidden xl:block flex-shrink-0">
          <RightSidebar />
        </div>
    </div>
  );
}