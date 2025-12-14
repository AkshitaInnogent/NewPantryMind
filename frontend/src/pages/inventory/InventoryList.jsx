import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchInventoryItems } from "../../features/inventory/inventoryThunks";
import { SearchInput, Button, Card, LoadingSpinner, EmptyState } from "../../components/ui";
import PageLayout from "../../components/layout/PageLayout";
import ManualConsumeModal from "../../components/inventory/ManualConsumeModal";
import { Package, Minus } from "lucide-react";

// Add CSS for stacked card effect
const stackedCardStyles = `
  .stacked-card::before,
  .stacked-card::after {
    content: '';
    position: absolute;
    top: 8px;
    left: 8px;
    right: -12px;
    bottom: -3px;
    background: #f8fafc;
    border: 2px solid #cbd5e1;
    border-radius: 0.75rem;
    box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.25);
    z-index: 1;
  }
  .stacked-card::after {
    top: 16px;
    left: 16px;
    right: -24px;
    bottom: -11px;
    background: #f1f5f9;
    border: 3px solid #e2e8f0;
    box-shadow: 0 6px 12px -4px rgba(0, 0, 0, 0.2);
    z-index: 0;
  }
  .stacked-card {
    margin: -5px 24px 21px 12px;
  }
  .stacked-card .card {
    border: 2px solid #16a34a !important;
    box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.15) !important;
  }
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('stacked-card-styles')) {
  const style = document.createElement('style');
  style.id = 'stacked-card-styles';
  style.textContent = stackedCardStyles;
  document.head.appendChild(style);
}

export default function InventoryList() {
  // Inject styles on component mount
  useEffect(() => {
    if (!document.getElementById('stacked-card-styles')) {
      const style = document.createElement('style');
      style.id = 'stacked-card-styles';
      style.textContent = stackedCardStyles;
      document.head.appendChild(style);
    }
  }, []);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, error } = useSelector((state) => state.inventory);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      showToast.error("Failed to load inventory items");
    }
  }, [error]);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [consumeModal, setConsumeModal] = useState({
    isOpen: false,
    item: null,
  });

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

  const openConsumeModal = (item) => {
    setConsumeModal({ isOpen: true, item });
  };

  const closeConsumeModal = () => {
    setConsumeModal({ isOpen: false, item: null });
  };

  const formatExpiryDate = (expiryDate) => {
    if (!expiryDate) return "NONE";
    const date = new Date(expiryDate);
    const today = new Date();
    const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24));

    if (diffDays <= 3) {
      return `⚠️ ${
        diffDays === 0 ? "Today" : `${diffDays} day${diffDays > 1 ? "s" : ""}`
      }`;
    }
    return date.toLocaleDateString();
  };

  const filteredItems = useMemo(() => {
    let filtered = items;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (item) =>
          item.categoryName?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [items, selectedCategory, searchTerm]);

  const getUniqueCategories = () => {
    const categories = ["All"];
    const uniqueCategories = [
      ...new Set(items.map((item) => item.categoryName).filter(Boolean)),
    ];
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

    if (
      category.includes("grain") ||
      category.includes("cereal") ||
      category.includes("bread")
    ) {
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
    if (category.includes("vegetable") || category.includes("veggie"))
      return "🥬";
    if (category.includes("fruit")) return "🍎";
    if (category.includes("meat") || category.includes("protein")) return "🥩";
    if (
      category.includes("grain") ||
      category.includes("cereal") ||
      category.includes("bread")
    )
      return "🍞";
    if (category.includes("beverage") || category.includes("drink"))
      return "🥤";
    if (category.includes("snack") || category.includes("candy")) return "🍪";
    if (category.includes("frozen")) return "🧊";
    if (category.includes("spice") || category.includes("seasoning"))
      return "🧂";
    if (category.includes("oil") || category.includes("condiment")) return "🫒";
    return "📦";
  };

  const handleSearch = useCallback((searchValue) => {
    setSearchTerm(searchValue);
  }, []);

  if (loading) {
    return (
      <PageLayout
        title="Inventory Items"
        subtitle="Manage your pantry items"
        icon={<Package className="w-6 h-6" />}
      >
        <LoadingSpinner text="Loading inventory..." />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Inventory Items"
      subtitle="Manage your pantry items"
      icon={<Package className="w-6 h-6" />}
      headerActions={
        <Button onClick={() => navigate("/inventory/add-ocr")}>
          📦 Add Inventory
        </Button>
      }
    >
      <div className="mb-6">
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
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] ${
                selectedCategory === category
                  ? "bg-green-600 text-white shadow-xl"
                  : "bg-white text-gray-700 hover:bg-green-50 border border-gray-200 hover:border-green-200"
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

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon={<Package className="w-16 h-16 text-gray-400" />}
          title="No inventory items found"
          description={
            searchTerm
              ? "Try adjusting your search terms"
              : "Start by adding some items to your inventory"
          }
          action={
            <Button onClick={() => navigate("/inventory/add-ocr")}>
              Add First Item
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.filter(item => (item.quantity || item.totalQuantity) > 0).map((item) => {
            const isLowStock = (item.quantity || item.totalQuantity) <= (item.minStock || 0);
            const isExpiringSoon = item.expiryDate ? 
              Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)) <= 3 : false;
            const hasMultipleItems = item.itemCount > 1 || (item.batches && item.batches.length > 1) || (item.entries && item.entries.length > 1);

            return (
              <div key={item.id} className={`relative ${hasMultipleItems ? 'stacked-card' : ''}`}>
                <Card className="hover:shadow-lg transition-all duration-300 ease-out hover:-translate-y-1 relative z-10 h-80">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    {getCategoryIcon(item.categoryName)}
                    {isLowStock && (
                      <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">
                        Low Stock
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.name}</h3>

                  {/* Quantity Display */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Quantity</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-gray-900">
                          {item.quantity || item.totalQuantity}
                        </span>
                        <span className="text-sm text-gray-500 font-medium">{item.unitName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  {item.locationName && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600">📍</span>
                        <span className="font-medium text-gray-700">{item.locationName}</span>
                      </div>
                    </div>
                  )}

                  {/* Expiry Date */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Early Expiry</span>
                      <span className={`text-sm font-bold px-2 py-1 rounded-full ${
                        isExpiringSoon
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {formatExpiryDate(item.expiryDate || item.earliestExpiry)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/inventory/details/${item.id}`);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl"
                    >
                      View
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openConsumeModal(item);
                      }}
                      className="flex-1 border border-green-600 text-green-700 py-2.5 px-4 rounded-lg font-semibold hover:bg-green-50 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl"
                    >
                      Use
                    </button>
                  </div>
                </div>
              </Card>
              </div>
            );
          })}
        </div>
      )}

      <ManualConsumeModal
        item={consumeModal.item}
        isOpen={consumeModal.isOpen}
        onClose={closeConsumeModal}
      />
    </PageLayout>
  );
}
