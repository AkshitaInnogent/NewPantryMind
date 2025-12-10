import { Package, IndianRupee, TrendingDown, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../../services/dashboardApi';

export default function InventoryStats() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStockCount: 0,
    expiryCount: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        console.log('Dashboard stats received:', data);
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchStats();
  }, []);
  const navigate = useNavigate();

  const handleLowStockClick = () => {
    navigate('/alerts/low-stock');
  };

  const handleExpiryClick = () => {
    navigate('/alerts/expiry');
  };

  const formatValue = (value) => {
    return `₹${value || 0}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div 
        className="bg-green-600 text-white p-6 rounded-xl shadow-lg cursor-pointer hover:bg-green-700 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl"
        onClick={() => navigate('/inventory')}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm font-medium">Total Products</p>
            <p className="text-3xl font-bold">{stats.totalProducts || 0}</p>
          </div>
          <Package className="h-12 w-12 text-green-200" />
        </div>
      </div>

      <div 
        className="bg-green-700 text-white p-6 rounded-xl shadow-lg cursor-pointer hover:bg-green-800 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl"
        onClick={() => navigate('/reports')}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm font-medium">Total Value</p>
            <p className="text-3xl font-bold">{formatValue(stats.totalValue)}</p>
          </div>
          <IndianRupee className="h-12 w-12 text-green-200" />
        </div>
      </div>

      <div 
        className="bg-orange-500 text-white p-6 rounded-xl shadow-lg cursor-pointer hover:bg-orange-600 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl"
        onClick={handleLowStockClick}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-100 text-sm font-medium">Low Stock Alerts</p>
            <p className="text-3xl font-bold">{stats.lowStockCount || 0}</p>
          </div>
          <TrendingDown className="h-12 w-12 text-orange-200" />
        </div>
      </div>

      <div 
        className="bg-red-500 text-white p-6 rounded-xl shadow-lg cursor-pointer hover:bg-red-600 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl"
        onClick={handleExpiryClick}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-100 text-sm font-medium">Expiry Alerts</p>
            <p className="text-3xl font-bold">{stats.expiryCount || 0}</p>
          </div>
          <AlertTriangle className="h-12 w-12 text-red-200" />
        </div>
      </div>
    </div>
  );
}