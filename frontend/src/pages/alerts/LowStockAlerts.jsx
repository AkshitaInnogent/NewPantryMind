import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageLayout from "../../components/layout/PageLayout";
import { Card } from "../../components/ui";
import { AlertTriangle, Package } from "lucide-react";
import { fetchInventory } from "../../features/inventory/inventoryThunks";

export default function LowStockAlerts() {
  const dispatch = useDispatch();
  const { items: inventory = [] } = useSelector(state => state.inventory || {});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await dispatch(fetchInventory());
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [dispatch]);

  const lowStockItems = inventory.filter(item => 
    item.totalQuantity < (item.minStock || 250)
  );

  return (
    <PageLayout
      title="Low Stock Alerts"
      subtitle="Items running low on stock"
      icon={<AlertTriangle className="w-6 h-6" />}
    >
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading alerts...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {lowStockItems.length > 0 ? (
            lowStockItems.map(item => (
              <Card key={item.id} className="p-4 border-l-4 border-l-red-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-red-500" />
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.categoryName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-red-600 font-medium">
                      {item.totalQuantity} {item.unitName}
                    </p>
                    <p className="text-xs text-gray-500">
                      Min: {item.minStock} {item.unitName}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Low Stock Items</h3>
              <p className="text-gray-600">All items are above minimum stock levels</p>
            </Card>
          )}
        </div>
      )}
    </PageLayout>
  );
}