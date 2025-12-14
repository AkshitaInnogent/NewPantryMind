import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Clock, Calendar, AlertTriangle, ShoppingCart, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { fetchInventoryItems } from "../../features/inventory/inventoryThunks";
import { fetchShoppingLists, addItemToList } from "../../features/shopping/shoppingThunks";
import { formatDate } from "../../utils/dateUtils";
import { showToast } from "../../utils/toast";
import RightSidebar from "../../components/layout/RightSidebar";
import { BackButton } from "../../components/ui";

export default function ExpiryAlerts() {
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
        await dispatch(fetchInventoryItems());
        if (user?.kitchenId) {
          await dispatch(fetchShoppingLists(user.kitchenId));
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [dispatch, user]);

  const getExpiringItems = () => {
    const today = new Date();
    const expiringItems = [];
    
    inventory.forEach(inv => {
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
            daysUntilExpiry: Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24)),
            unitId: inv.unitId
          });
        }
      }
    });
    
    return expiringItems.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  };

  const expiringItems = getExpiringItems();
  const totalPages = Math.ceil(expiringItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = expiringItems.slice(startIndex, startIndex + itemsPerPage);

  const isItemInShoppingList = (itemName) => {
    const dailyList = lists.find(list => list.listType === 'DAILY');
    return dailyList?.items?.some(item => 
      item.canonicalName?.toLowerCase() === itemName.toLowerCase()
    ) || false;
  };

  const handleAddToShoppingList = async (item) => {
    const dailyList = lists.find(list => list.listType === 'DAILY');
    if (!dailyList) {
      showToast.error('Daily shopping list not found');
      return;
    }

    setAddingToCart(prev => ({ ...prev, [item.id]: true }));
    
    try {
      // Find the original inventory item to get unitId
      const inventoryItem = inventory.find(inv => inv.id === item.id);
      await dispatch(addItemToList({
        shoppingListId: dailyList.id,
        canonicalName: item.inventoryName,
        suggestedQuantity: item.quantity,
        unitId: inventoryItem?.unitId || 1
      }));
      showToast.success(`${item.inventoryName} added to shopping list`);
    } catch (error) {
      showToast.error('Failed to add item to shopping list');
    } finally {
      setAddingToCart(prev => ({ ...prev, [item.id]: false }));
    }
  };

  const getUrgencyColor = (days) => {
    if (days <= 0) return "text-red-600 bg-red-50 border-red-200";
    if (days <= 2) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-yellow-600 bg-yellow-50 border-yellow-200";
  };

  const getUrgencyInfo = (days) => {
    if (days <= 0) return {
      bgColor: "bg-red-100",
      textColor: "text-red-600",
      icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
      status: "Expired",
      message: "has expired and should be removed"
    };
    if (days <= 1) return {
      bgColor: "bg-red-100",
      textColor: "text-red-600",
      icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
      status: "Expires today",
      message: "expires today - use immediately"
    };
    if (days <= 2) return {
      bgColor: "bg-orange-100",
      textColor: "text-orange-600",
      icon: <Clock className="w-6 h-6 text-orange-600" />,
      status: `${days} days left`,
      message: `expires in ${days} days - use soon`
    };
    return {
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-600",
      icon: <Calendar className="w-6 h-6 text-yellow-600" />,
      status: `${days} days left`,
      message: `expires in ${days} days`
    };
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
                <h1 className="text-2xl font-bold text-gray-900">Expiry Alerts</h1>
                <p className="text-gray-600">Items nearing expiration</p>
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
              {expiringItems.length > 0 ? (
                <>
                  {paginatedItems.map(item => {
                    const urgency = getUrgencyInfo(item.daysUntilExpiry);
                    return (
                      <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-full ${urgency.bgColor} flex-shrink-0`}>
                            <Calendar className={`w-5 h-5 ${urgency.textColor}`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-900">{item.inventoryName}</h3>
                                <p className="text-sm text-gray-500">{item.categoryName}</p>
                              </div>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                item.daysUntilExpiry <= 0 ? 'bg-red-100 text-red-700' :
                                item.daysUntilExpiry <= 2 ? 'bg-orange-100 text-orange-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {urgency.status}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between mb-3">
                              <div className="text-sm text-gray-600">
                                Quantity: <span className="font-medium text-gray-900">{item.quantity} {item.unitName}</span>
                              </div>
                              <div className="text-sm text-gray-600">
                                Expires: <span className={`font-medium ${urgency.textColor}`}>{formatDate(item.expiryDate)}</span>
                              </div>
                            </div>
                            
                            <div>
                              {isItemInShoppingList(item.inventoryName) ? (
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
                        Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, expiringItems.length)} of {expiringItems.length} alerts
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
                    <Calendar className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">🎉 All Fresh!</h3>
                  <p className="text-gray-600 mb-4">All items are within safe expiry periods. Your pantry is well-maintained!</p>
                  <p className="text-sm text-gray-500">We'll notify you when items are nearing expiration.</p>
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