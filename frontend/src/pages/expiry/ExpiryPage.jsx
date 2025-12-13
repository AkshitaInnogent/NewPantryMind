import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { AlertTriangle, Calendar, User, Package, ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui';

export default function ExpiryPage() {
  const { user } = useSelector((state) => state.auth || {});
  const [expiredItems, setExpiredItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpiredItems();
  }, [user?.kitchenId]);

  const fetchExpiredItems = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/inventory/expired?kitchenId=${user?.kitchenId}`);
      if (response.ok) {
        const data = await response.json();
        setExpiredItems(Array.isArray(data) ? data : []);
      } else {
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
          notes: 'Manually marked as waste from expiry page',
          reportedBy: user?.id || 1
        })
      });
      
      fetchExpiredItems();
    } catch (error) {
      console.error('Failed to mark item as waste:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Expired Items</h1>
              <p className="text-gray-600">Manage expired inventory items</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{expiredItems.length}</div>
              <div className="text-gray-600">Total Expired Items</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {expiredItems.reduce((sum, item) => sum + item.currentQuantity, 0)}
              </div>
              <div className="text-gray-600">Total Quantity</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                ₹{expiredItems.reduce((sum, item) => 
                  sum + (item.price ? (item.price * item.currentQuantity / item.originalQuantity) : 0), 0
                ).toFixed(2)}
              </div>
              <div className="text-gray-600">Estimated Waste Value</div>
            </div>
          </div>
        </div>

        {/* Expired Items List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Expired Items Details</h2>
          </div>

          <div className="p-6">
            {expiredItems.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Expired Items</h3>
                <p className="text-gray-500">Great job managing your inventory!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {expiredItems.map((item) => (
                  <div key={item.id} className="border border-red-200 rounded-lg p-6 bg-red-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">{item.name}</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                              <span className="font-medium">Waste Value:</span> ₹{(item.price * item.currentQuantity / item.originalQuantity).toFixed(2)}
                            </div>
                          )}
                        </div>

                        {item.categoryName && (
                          <div className="mt-2">
                            <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                              {item.categoryName}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {user?.role === 'ADMIN' && (
                        <Button
                          onClick={() => handleMarkAsWaste(item.id)}
                          className="ml-4 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                          Mark as Waste
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}