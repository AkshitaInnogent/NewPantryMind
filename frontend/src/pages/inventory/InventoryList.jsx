import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchInventoryItems, deleteInventoryItem } from "../../features/inventory/inventoryThunks";
import { SearchInput } from "../../components/ui";

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
  }, [dispatch]);

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

  const menuItems = [
    {
      title: "Dashboard",
      description: "Back to dashboard",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      ),
      color: "blue",
      onClick: () => navigate(user?.role === "ADMIN" ? "/admin" : "/member")
    },
    {
      title: "Add Inventory",
      description: "Add new inventory items",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      color: "green",
      onClick: () => navigate("/inventory/add-ocr")
    },
    {
      title: "Reports",
      description: "View inventory reports",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: "purple",
      onClick: () => {}
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      green: "bg-green-50 hover:bg-green-100 text-green-800 border-green-200",
      blue: "bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200",
      purple: "bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-200",
      gray: "bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[color] || colors.gray;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg">Loading inventory...</div>
        </div>
        <div className="w-80 p-6">
          <div className="bg-white rounded-lg shadow p-6 h-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Menu</h2>
            <div className="space-y-4">
              {menuItems.map((item, index) => (
                <div key={index} className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${getColorClasses(item.color)}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-current">{item.icon}</span>
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm opacity-75 mt-1">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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
              const expiryStatus = getExpiryStatus(item.expiryDate);
              return (
                <div key={item.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6">
                  {/* Item Header */}
                  <div className="flex items-start gap-4 mb-4">
                    {getCategoryIcon(item.categoryName)}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
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
                      <span className="text-sm text-gray-500">Quantity</span>
                      <span className="text-sm font-medium text-gray-900">{item.quantity} {item.unitName || ""}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Location</span>
                      <span className="text-sm font-medium text-gray-900">{item.location || "N/A"}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Expiry</span>
                      {item.expiryDate ? (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getExpiryColor(expiryStatus)}`}>
                          {new Date(item.expiryDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">No expiry</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-6 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => navigate(`/inventory/edit/${item.id}`)}
                      className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Sidebar Menu */}
      <div className="w-80 p-6">
        <div className="bg-white rounded-lg shadow p-6 h-full">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Menu</h2>
          
          <div className="space-y-4">
            {menuItems.map((item, index) => (
              <div
                key={index}
                onClick={item.onClick}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${getColorClasses(item.color)}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-current">{item.icon}</span>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm opacity-75 mt-1">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}