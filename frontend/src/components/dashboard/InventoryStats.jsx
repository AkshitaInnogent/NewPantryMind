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
        setStats(data);
      } catch (error) {
        // Failed to fetch stats
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
      <div 
        className="bg-white rounded-2xl shadow-lg p-6 border border-green-200 hover:shadow-xl transition-shadow cursor-pointer group"
        onClick={() => navigate('/inventory')}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-green-600">
              {stats.totalProducts || 0}
            </div>
            <div className="text-gray-700 font-medium">Total Products</div>
            <div className="text-xs text-green-600 mt-1 font-semibold">
              Inventory Items
            </div>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
            <Package className="text-green-600 text-xl" />
          </div>
        </div>
      </div>

      <div 
        className="bg-white rounded-2xl shadow-lg p-6 border border-green-200 hover:shadow-xl transition-shadow cursor-pointer group"
        onClick={() => navigate('/reports')}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-green-600">
              {formatValue(stats.totalValue)}
            </div>
            <div className="text-gray-700 font-medium">Total Value</div>
            <div className="text-xs text-green-600 mt-1 font-semibold">
              Inventory Worth
            </div>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
            <IndianRupee className="text-green-600 text-xl" />
          </div>
        </div>
      </div>

      <div 
        className="bg-white rounded-2xl shadow-lg p-6 border border-orange-200 hover:shadow-xl transition-shadow cursor-pointer group"
        onClick={handleLowStockClick}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-orange-600">
              {stats.lowStockCount || 0}
            </div>
            <div className="text-gray-700 font-medium">Low Stock</div>
            <div className="text-xs text-orange-600 mt-1 font-semibold">
              {stats.lowStockCount > 0 ? 'Needs Restocking' : 'All Good'}
            </div>
          </div>
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
            <TrendingDown className="text-orange-600 text-xl" />
          </div>
        </div>
      </div>

      <div 
        className="bg-white rounded-2xl shadow-lg p-6 border border-red-200 hover:shadow-xl transition-shadow cursor-pointer group"
        onClick={handleExpiryClick}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-red-600">
              {stats.expiryCount || 0}
            </div>
            <div className="text-gray-700 font-medium">Expiry Alerts</div>
            <div className="text-xs text-red-600 mt-1 font-semibold">
              {stats.expiryCount > 0 ? 'Action Required' : 'All Fresh'}
            </div>
          </div>
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors">
            <AlertTriangle className="text-red-600 text-xl" />
          </div>
        </div>
      </div>

      <div 
        className="bg-white rounded-2xl shadow-lg p-6 border border-red-200 hover:shadow-xl transition-shadow cursor-pointer group"
        onClick={() => navigate('/expired-products')}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-red-600">
              View
            </div>
            <div className="text-gray-700 font-medium">Expired Items</div>
            <div className="text-xs text-red-600 mt-1 font-semibold">
              Clean Up Required
            </div>
          </div>
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors">
            <Package className="text-red-600 text-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}