import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageLayout from "../../components/layout/PageLayout";
import { Card, Input } from "../../components/ui";
import { Settings as SettingsIcon, Bell, Search } from "lucide-react";
import { fetchInventory, updateInventoryAlerts } from "../../features/inventory/inventoryThunks";
import AlertSettings from "../../components/settings/AlertSettings";

export default function Settings() {
  const dispatch = useDispatch();
  const { items: inventory = [] } = useSelector(state => state.inventory || {});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState({});
  const [pendingChanges, setPendingChanges] = useState({});

  useEffect(() => {
    const loadInventory = async () => {
      try {
        await dispatch(fetchInventory());
      } catch (err) {
        setError(err.message || 'Failed to load inventory');
      } finally {
        setLoading(false);
      }
    };
    loadInventory();
  }, [dispatch]);

  const timeoutRef = useRef({});

  const handleInputChange = (inventoryId, field, value) => {
    setPendingChanges(prev => ({
      ...prev,
      [`${inventoryId}-${field}`]: value
    }));

    const key = `${inventoryId}-${field}`;
    
    // Clear existing timeout
    if (timeoutRef.current[key]) {
      clearTimeout(timeoutRef.current[key]);
    }

    // Set new timeout
    timeoutRef.current[key] = setTimeout(async () => {
      setSaving(prev => ({ ...prev, [key]: true }));
      try {
        await dispatch(updateInventoryAlerts(inventoryId, { [field]: parseInt(value) }));
        setTimeout(() => {
          setSaving(prev => ({ ...prev, [key]: false }));
        }, 800);
      } catch (err) {
        setError(`Failed to update ${field}: ${err.message}`);
        setSaving(prev => ({ ...prev, [key]: false }));
      }
    }, 1000);
  };

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageLayout
      title="Settings"
      subtitle="Kitchen settings and preferences"
      icon={<SettingsIcon className="w-6 h-6" />}
    >
      <div className="space-y-6">
        <AlertSettings />
        
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-semibold">Inventory Alert Settings</h2>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 w-full"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>
          <p className="text-gray-600 mb-6">
            Settings auto-save when you change them. Values update immediately.
          </p>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading inventory...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>Error: {error}</p>
            </div>
          ) : (
            <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 sm:px-4 font-medium text-sm sm:text-base">Item Name</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-medium text-sm sm:text-base">Category</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-medium text-sm sm:text-base">Expiry Alert (Days)</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-medium text-sm sm:text-base">Min Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory?.length > 0 ? (
                    filteredInventory.map(item => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2 sm:px-4 font-medium text-sm sm:text-base">{item.name}</td>
                        <td className="py-3 px-2 sm:px-4 text-gray-600 text-sm sm:text-base">{item.categoryName}</td>
                        <td className="py-3 px-2 sm:px-4">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={pendingChanges[`${item.id}-minExpiryDaysAlert`] ?? item.minExpiryDaysAlert ?? 3}
                              onChange={(e) => handleInputChange(item.id, 'minExpiryDaysAlert', e.target.value)}
                              min="1"
                              max="30"
                              className="w-12 sm:w-16 text-center text-sm"
                            />
                            {saving[`${item.id}-minExpiryDaysAlert`] && (
                              <span className="text-xs text-green-600 ml-1">✓</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-2 sm:px-4">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Input
                              type="number"
                              value={pendingChanges[`${item.id}-minStock`] ?? item.minStock ?? 250}
                              onChange={(e) => handleInputChange(item.id, 'minStock', e.target.value)}
                              min="1"
                              className="w-16 sm:w-20 text-center text-sm"
                            />
                            <span className="text-xs sm:text-sm text-gray-500">{item.unitName}</span>
                            {saving[`${item.id}-minStock`] && (
                              <span className="text-xs text-green-600 ml-1">✓</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-gray-500">
                        {search ? 'No items match your search' : 'No inventory items found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Mobile Card Layout */}
            <div className="sm:hidden space-y-4">
              {filteredInventory?.length > 0 ? (
                filteredInventory.map(item => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="mb-3">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.categoryName}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Expiry Alert (Days)</label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={pendingChanges[`${item.id}-minExpiryDaysAlert`] ?? item.minExpiryDaysAlert ?? 3}
                            onChange={(e) => handleInputChange(item.id, 'minExpiryDaysAlert', e.target.value)}
                            min="1"
                            max="30"
                            className="w-16 text-center text-sm"
                          />
                          {saving[`${item.id}-minExpiryDaysAlert`] && (
                            <span className="text-xs text-green-600">✓</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Min Stock</label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={pendingChanges[`${item.id}-minStock`] ?? item.minStock ?? 250}
                            onChange={(e) => handleInputChange(item.id, 'minStock', e.target.value)}
                            min="1"
                            className="w-20 text-center text-sm"
                          />
                          <span className="text-xs text-gray-500">{item.unitName}</span>
                          {saving[`${item.id}-minStock`] && (
                            <span className="text-xs text-green-600">✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {search ? 'No items match your search' : 'No inventory items found'}
                </div>
              )}
            </div>
            </>
          )}
        </Card>
      </div>
    </PageLayout>
  );
}