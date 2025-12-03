import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchInventoryItems, deleteInventoryItem } from "../../features/inventory/inventoryThunks";
import { SearchInput } from "../../components/ui";
import RightSidebar from "../../components/layout/RightSidebar";

export default function InventoryList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, error } = useSelector((state) => state.inventory);
  const { user } = useSelector((state) => state.auth || {});
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchInventoryItems());
    
    // Listen for inventory updates
    const handleInventoryUpdate = () => {
      dispatch(fetchInventoryItems());
    };
    
    window.addEventListener('inventoryUpdated', handleInventoryUpdate);
    
    return () => {
      window.removeEventListener('inventoryUpdated', handleInventoryUpdate);
    };
  }, [dispatch]);

  const getCardStyle = (itemCount) => {
    const stackOffset = Math.min(itemCount, 3); // max 3 layers
    return {
      className: "bg-white rounded-lg relative transition-all duration-300",
      style: {
        boxShadow: `0 ${stackOffset * 2}px ${stackOffset * 4}px rgba(0,0,0,0.1), 0 ${stackOffset}px ${stackOffset * 2}px rgba(0,0,0,0.05)`,
        transform: `translateY(-${stackOffset}px)`,
        zIndex: stackOffset
      }
    };
  };


  const getBadgeStyle = (itemCount) => {
    if (itemCount <= 1) return "px-2 py-1 text-xs";
    if (itemCount <= 4) return "px-3 py-1 text-sm";
    return "px-4 py-2 text-base font-bold";
  };

  const formatExpiryDate = (expiryDate) => {
    if (!expiryDate) return "No upcoming expiry";
    const date = new Date(expiryDate);
    const today = new Date();
    const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 3) {
      return `⚠️ ${diffDays === 0 ? 'Today' : `${diffDays} day${diffDays > 1 ? 's' : ''}`}`;
    }
    return date.toLocaleDateString();
  };

  useEffect(() => {
    filterItems();
  }, [items, selectedCategory, searchTerm]);

  const filterItems = () => {
    let filtered = items;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(item => 
        item.categoryName?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const getUniqueCategories = () => {
    const categories = ["All"];
    const uniqueCategories = [...new Set(items.map(item => item.categoryName).filter(Boolean))];
    return categories.concat(uniqueCategories.sort());
  };

  const getCategoryIcon = (categoryName) => {
    const category = categoryName?.toLowerCase() || "";
    
    if (category.includes("dairy") || category.includes("milk")) {
      return (
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 text-2xl">🥛</span>
        </div>
      );
    }
    
    if (category.includes("vegetable") || category.includes("veggie")) {
      return (
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <span className="text-green-600 text-2xl">🥬</span>
        </div>
      );
    }
    
    if (category.includes("fruit")) {
      return (
        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
          <span className="text-orange-600 text-2xl">🍎</span>
        </div>
      );
    }
    
    if (category.includes("meat") || category.includes("protein")) {
      return (
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-red-600 text-2xl">🥩</span>
        </div>
      );
    }
    
    if (category.includes("grain") || category.includes("cereal") || category.includes("bread")) {
      return (
        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
          <span className="text-yellow-600 text-2xl">🍞</span>
        </div>
      );
    }
    
    if (category.includes("beverage") || category.includes("drink")) {
      return (
        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
          <span className="text-purple-600 text-2xl">🥤</span>
        </div>
      );
    }
    
    if (category.includes("snack") || category.includes("candy")) {
      return (
        <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
          <span className="text-pink-600 text-2xl">🍪</span>
        </div>
      );
    }
    
    if (category.includes("frozen")) {
      return (
        <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
          <span className="text-cyan-600 text-2xl">🧊</span>
        </div>
      );
    }
    
    if (category.includes("spice") || category.includes("seasoning")) {
      return (
        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
          <span className="text-amber-600 text-2xl">🧂</span>
        </div>
      );
    }
    
    if (category.includes("oil") || category.includes("condiment")) {
      return (
        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
          <span className="text-yellow-700 text-2xl">🫒</span>
        </div>
      );
    }
    
    // Default icon for uncategorized items
    return (
      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
        <span className="text-gray-600 text-2xl">📦</span>
      </div>
    );
  };

  const getCategoryTabIcon = (categoryName) => {
    const category = categoryName?.toLowerCase() || "";
    
    if (categoryName === "All") return "🏠";
    if (category.includes("dairy") || category.includes("milk")) return "🥛";
    if (category.includes("vegetable") || category.includes("veggie")) return "🥬";
    if (category.includes("fruit")) return "🍎";
    if (category.includes("meat") || category.includes("protein")) return "🥩";
    if (category.includes("grain") || category.includes("cereal") || category.includes("bread")) return "🍞";
    if (category.includes("beverage") || category.includes("drink")) return "🥤";
    if (category.includes("snack") || category.includes("candy")) return "🍪";
    if (category.includes("frozen")) return "🧊";
    if (category.includes("spice") || category.includes("seasoning")) return "🧂";
    if (category.includes("oil") || category.includes("condiment")) return "🫒";
    return "📦";
  };

  const handleSearch = useCallback((searchValue) => {
    setSearchTerm(searchValue);
  }, []);

  const handleDelete = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      dispatch(deleteInventoryItem(itemId));
    }
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return "no-expiry";
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "expired";
    if (diffDays <= 3) return "expiring-soon";
    if (diffDays <= 7) return "expiring-week";
    return "fresh";
  };

  const getExpiryColor = (status) => {
    switch (status) {
      case "expired": return "bg-red-100 text-red-800";
      case "expiring-soon": return "bg-orange-100 text-orange-800";
      case "expiring-week": return "bg-yellow-100 text-yellow-800";
      case "fresh": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };





  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg">Loading inventory...</div>
        </div>
        <RightSidebar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Inventory Items</h1>
            <button
              onClick={() => navigate("/inventory/add-ocr")}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              📦 Add Inventory
            </button>
          </div>
          
          {/* Search */}
          <SearchInput
            placeholder="Search items, categories, locations..."
            onSearch={handleSearch}
            className="max-w-md mb-4"
          />

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {getUniqueCategories().map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                <span className="text-lg">{getCategoryTabIcon(category)}</span>
                {category}
                <span className="text-xs opacity-75">
                  ({category === "All" ? items.length : items.filter(item => item.categoryName === category).length})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {items.length === 0 ? (
                <>No inventory items found. <button onClick={() => navigate("/inventory/add")} className="text-green-600 hover:underline">Add your first item</button></>
              ) : (
                `No items found ${selectedCategory !== "All" ? `in ${selectedCategory} category` : ""} ${searchTerm ? `matching "${searchTerm}"` : ""}.`
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              const itemCount = item.itemCount || 0;
              const layers = Math.min(itemCount, 4);
              
              if (itemCount > 1) {
                return (
                  <div key={item.id} className="relative">
                    {Array.from({ length: layers - 1 }, (_, i) => (
                      <div 
                        key={i} 
                        className="absolute w-full h-full bg-white rounded-lg" 
                        style={{ 
                          top: `${(layers - 1 - i) * 4}px`, 
                          left: `${(layers - 1 - i) * 4}px`,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                        }}
                      ></div>
                    ))}
                    <div className="relative w-full bg-white rounded-lg shadow-lg p-6">
                  {/* Item Header */}
                  <div className="flex items-start gap-4 mb-4">
                    {getCategoryIcon(item.categoryName)}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {item.name ? item.name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ') : 'Unknown Item'}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-gray-600">{item.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Item Details */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Category</span>
                      <span className="text-sm font-medium text-gray-900">{item.categoryName || "N/A"}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Total Quantity</span>
                      <span className="text-sm font-medium text-gray-900">{item.totalQuantity} {item.unitName || ""}</span>
                    </div>



                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Early Expiry</span>
                      <span className="text-xs font-medium text-gray-700">
                        {formatExpiryDate(item.earliestExpiry)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-6 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => navigate(`/inventory/details/${item.id}`)}
                      className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={item.id} className="bg-white rounded-lg shadow p-6">
                    {/* Item Header */}
                    <div className="flex items-start gap-4 mb-4">
                      {getCategoryIcon(item.categoryName)}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {item.name ? item.name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ') : 'Unknown Item'}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-gray-600">{item.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Item Details */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Category</span>
                        <span className="text-sm font-medium text-gray-900">{item.categoryName || "N/A"}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Total Quantity</span>
                        <span className="text-sm font-medium text-gray-900">{item.totalQuantity} {item.unitName || ""}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Early Expiry</span>
                        <span className="text-xs font-medium text-gray-700">
                          {formatExpiryDate(item.earliestExpiry)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-6 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => navigate(`/inventory/details/${item.id}`)}
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>

      <RightSidebar />
    </div>
  );
}