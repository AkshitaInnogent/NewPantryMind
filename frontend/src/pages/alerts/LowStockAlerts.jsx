import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import RightSidebar from "../../components/layout/RightSidebar";
import { BackButton } from "../../components/ui";
import { AlertTriangle, Package, ShoppingCart, X, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { fetchInventory } from "../../features/inventory/inventoryThunks";
import { fetchShoppingLists, addItemToList } from "../../features/shopping/shoppingThunks";
import { showToast } from "../../utils/toast";

export default function LowStockAlerts() {
  const dispatch = useDispatch();
  const { items: inventory = [] } = useSelector(state => state.inventory || {});
  const { lists } = useSelector(state => state.shopping || {});
  const { user } = useSelector(state => state.auth || {});
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadData = async () => {
      try {
        await dispatch(fetchInventory());
        if (user?.kitchenId) {
          await dispatch(fetchShoppingLists(user.kitchenId));
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [dispatch, user]);

  const lowStockItems = inventory.filter(item => 
    item.totalQuantity < (item.minStock || 250)
  );

  const totalPages = Math.ceil(lowStockItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = lowStockItems.slice(startIndex, startIndex + itemsPerPage);

  const isItemInShoppingList = (itemName) => {
    const dailyList = lists.find(list => list.listType === 'DAILY');
    return dailyList?.items?.some(item => 
      item.canonicalName?.toLowerCase() === itemName.toLowerCase()
    ) || false;
  };

  const getStockLevel = (current, min) => {
    const percentage = (current / min) * 100;
    if (percentage <= 25) return { level: 'critical', text: 'Critical' };
    if (percentage <= 50) return { level: 'low', text: 'Low' };
    return { level: 'warning', text: 'Warning' };
  };

  const handleAddToShoppingList = async (item) => {
    const dailyList = lists.find(list => list.listType === 'DAILY');
    if (!dailyList) {
      showToast.error('Daily shopping list not found');
      return;
    }

    setAddingToCart(prev => ({ ...prev, [item.id]: true }));
    
    try {
      const neededQuantity = (item.minStock || 250) - item.totalQuantity;
      await dispatch(addItemToList({
        shoppingListId: dailyList.id,
        canonicalName: item.name,
        suggestedQuantity: neededQuantity,
        unitId: item.unitId
      }));
      showToast.success(`${item.name} added to shopping list`);
    } catch (error) {
      showToast.error('Failed to add item to shopping list');
    } finally {
      setAddingToCart(prev => ({ ...prev, [item.id]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="flex-1 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <BackButton />
          </div>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Low Stock Alerts</h1>
                <p className="text-gray-600">Items running low on stock</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading alerts...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockItems.length > 0 ? (
                <>
                  {paginatedItems.map(item => {
                  const stockInfo = getStockLevel(item.totalQuantity, item.minStock || 250);
                  return (
                    <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="p-2 rounded-full bg-red-100 flex-shrink-0">
                          <Package className="w-5 h-5 text-red-600" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">{item.name}</h3>
                              <p className="text-sm text-gray-500">{item.categoryName}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              stockInfo.level === 'critical' ? 'bg-red-100 text-red-700' :
                              stockInfo.level === 'low' ? 'bg-orange-100 text-orange-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {stockInfo.text}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-sm text-gray-600">
                              Current: <span className="font-medium text-gray-900">{item.totalQuantity} {item.unitName}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              Min: <span className="font-medium text-gray-900">{item.minStock || 250} {item.unitName}</span>
                            </div>
                          </div>
                          
                          <div>
                            {isItemInShoppingList(item.name) ? (
                              <div className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 text-sm font-medium rounded-lg">
                                <Check className="w-4 h-4" />
                                Already Added
                              </div>
                            ) : (
                              <button 
                                onClick={() => handleAddToShoppingList(item)}
                                disabled={addingToCart[item.id]}
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                              >
                                {addingToCart[item.id] ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                  <ShoppingCart className="w-4 h-4" />
                                )}
                                Add to Shopping List
                              </button>
                            )}

                          </div>
                        </div>
                      </div>
                    </div>
                  );
                  })}
                  
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-4 mt-6">
                      <div className="text-sm text-gray-600">
                        Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, lowStockItems.length)} of {lowStockItems.length} alerts
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="px-3 py-1 text-sm font-medium">
                          {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
                    <Package className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">🎉 All Good!</h3>
                  <p className="text-gray-600 mb-4">All items are above minimum stock levels. Your pantry is well-stocked!</p>
                  <p className="text-sm text-gray-500">We'll notify you when any items run low.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <RightSidebar />
    </div>
  );
}