import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import PageLayout from "../../components/layout/PageLayout";
import { Card } from "../../components/ui";
import { Trash2, Calendar, Package } from "lucide-react";
import { formatDate } from "../../utils/dateUtils";

export default function ExpiredProducts() {
  const { user } = useSelector(state => state.auth);
  const [wastedItems, setWastedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWastedItems();
  }, [user?.kitchenId]);

  const fetchWastedItems = async () => {
    if (!user?.kitchenId) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/inventory/expired?kitchenId=${user.kitchenId}`);
      if (response.ok) {
        const data = await response.json();
        setWastedItems(data);
      }
    } catch (error) {
      console.error('Failed to fetch expired items:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalProducts = wastedItems.length;
  const totalWastage = wastedItems.reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <PageLayout
      title="Expired Products"
      subtitle="Items that have expired"
      icon={<Trash2 className="w-6 h-6" />}
    >
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading expired items...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="p-4 bg-red-50 border-red-200">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-sm text-red-600 font-medium">Total Products</p>
                  <p className="text-2xl font-bold text-red-700">{totalProducts}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-red-50 border-red-200">
              <div className="flex items-center gap-3">
                <Trash2 className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-sm text-red-600 font-medium">Total Wastage</p>
                  <p className="text-2xl font-bold text-red-700">₹{totalWastage.toFixed(2)}</p>
                </div>
              </div>
            </Card>
          </div>
          <div className="space-y-4">
          {wastedItems.length > 0 ? (
            wastedItems.map(item => (
              <Card key={item.id} className="p-4 border-l-4 border-l-red-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Trash2 className="w-5 h-5 text-red-500" />
                    <div>
                      <h3 className="font-medium">{item.description || item.name || 'Unknown Item'}</h3>
                      <p className="text-sm text-gray-600">
                        {item.quantity} {item.unitName} • Expired
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-600">
                      ₹{item.price || 0}
                    </p>
                    <p className="text-xs text-gray-500">
                      Expired: {formatDate(item.expiryDate)}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Expired Items</h3>
              <p className="text-gray-600">Great job managing your inventory!</p>
            </Card>
          )}
          </div>
        </>
      )}
    </PageLayout>
  );
}