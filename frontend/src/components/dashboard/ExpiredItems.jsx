import { useState, useEffect } from 'react';
import { AlertTriangle, Calendar, User, Package } from 'lucide-react';

export default function ExpiredItems({ kitchenId, userRole }) {
  const [expiredItems, setExpiredItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpiredItems();
  }, [kitchenId]);

  const fetchExpiredItems = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/inventory/expired?kitchenId=${kitchenId}`);
      if (response.ok) {
        const data = await response.json();
        setExpiredItems(Array.isArray(data) ? data : []);
      } else {
        console.error('API returned error:', response.status);
        setExpiredItems([]);
      }
    } catch (error) {
      console.error('Failed to fetch expired items:', error);
      setExpiredItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsWaste = async (itemId) => {
    try {
      await fetch(`http://localhost:8080/api/tracking/waste-item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: itemId,
          quantity: expiredItems.find(item => item.id === itemId)?.currentQuantity || 0,
          reason: 'EXPIRED',
          notes: 'Manually marked as waste from dashboard',
          reportedBy: 1 // Current user ID
        })
      });
      
      // Refresh the list
      fetchExpiredItems();
    } catch (error) {
      console.error('Failed to mark item as waste:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900">Expired Items</h3>
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {expiredItems.length}
          </span>
        </div>
      </div>

      <div className="p-6">
        {expiredItems.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No expired items found</p>
            <p className="text-sm text-gray-400">Great job managing your inventory!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {expiredItems.map((item) => (
              <div key={item.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Package className="w-4 h-4" />
                        <span>{item.currentQuantity} {item.unitName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <Calendar className="w-4 h-4" />
                        <span>Expired: {new Date(item.expiryDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>Added by: {item.addedByName}</span>
                      </div>
                      {item.price && (
                        <div className="text-sm text-gray-600">
                          Estimated waste value: ₹{(item.price * item.currentQuantity / item.originalQuantity).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {userRole === 'ADMIN' && (
                    <button
                      onClick={() => handleMarkAsWaste(item.id)}
                      className="ml-4 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Mark as Waste
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}