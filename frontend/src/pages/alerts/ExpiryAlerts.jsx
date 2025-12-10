import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageLayout from "../../components/layout/PageLayout";
import { Card } from "../../components/ui";
import { Clock, Calendar } from "lucide-react";
import { fetchInventory } from "../../features/inventory/inventoryThunks";
import { formatDate } from "../../utils/dateUtils";

export default function ExpiryAlerts() {
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

  const getExpiringItems = () => {
    const today = new Date();
    const expiringItems = [];
    
    inventory.forEach(inv => {
      // Check if this inventory has an earliest expiry that falls within alert window
      if (inv.earliestExpiry) {
        const expiryDate = new Date(inv.earliestExpiry);
        const alertDays = inv.minExpiryDaysAlert || 3;
        const alertDate = new Date(today);
        alertDate.setDate(today.getDate() + alertDays);
        
        if (expiryDate <= alertDate) {
          expiringItems.push({
            id: inv.id,
            inventoryName: inv.name,
            categoryName: inv.categoryName,
            unitName: inv.unitName,
            quantity: inv.totalQuantity,
            expiryDate: inv.earliestExpiry,
            alertDays,
            daysUntilExpiry: Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))
          });
        }
      }
    });
    
    return expiringItems.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  };

  const expiringItems = getExpiringItems();



  const getUrgencyColor = (days) => {
    if (days <= 0) return "text-red-600 bg-red-50 border-red-200";
    if (days <= 2) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-yellow-600 bg-yellow-50 border-yellow-200";
  };

  return (
    <PageLayout
      title="Expiry Alerts"
      subtitle="Items nearing expiration"
      icon={<Clock className="w-6 h-6" />}
    >
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading alerts...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {expiringItems.length > 0 ? (
            expiringItems.map(item => (
              <Card key={item.id} className={`p-4 border-l-4 ${getUrgencyColor(item.daysUntilExpiry).includes('red') ? 'border-l-red-500' : item.daysUntilExpiry <= 2 ? 'border-l-orange-500' : 'border-l-yellow-500'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className={`w-5 h-5 ${item.daysUntilExpiry <= 0 ? 'text-red-500' : item.daysUntilExpiry <= 2 ? 'text-orange-500' : 'text-yellow-500'}`} />
                    <div>
                      <h3 className="font-medium">{item.inventoryName}</h3>
                      <p className="text-sm text-gray-600">{item.categoryName} • {item.quantity} {item.unitName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${item.daysUntilExpiry <= 0 ? 'text-red-600' : item.daysUntilExpiry <= 2 ? 'text-orange-600' : 'text-yellow-600'}`}>
                      {item.daysUntilExpiry <= 0 ? 'Expired' : `${item.daysUntilExpiry} days left`}
                    </p>
                    <p className="text-xs text-gray-500">
                      Expires: {formatDate(item.expiryDate)}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Expiring Items</h3>
              <p className="text-gray-600">All items are within safe expiry periods</p>
            </Card>
          )}
        </div>
      )}
    </PageLayout>
  );
}