import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchInventoryItems, manualConsumeItem } from "../../features/inventory/inventoryThunks";
import { SearchInput, Button, Card, LoadingSpinner, Alert, EmptyState } from "../../components/ui";
import PageLayout from "../../components/layout/PageLayout";
import { Package, Minus, X } from "lucide-react";

// Manual Consume Modal Component
function ManualConsumeModal({ item, isOpen, onClose }) {
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !item) return null;

  const handleConsume = async () => {
    if (quantity <= 0 || quantity > item.quantity) return;
    
    setIsLoading(true);
    try {
      await dispatch(manualConsumeItem(item.id, quantity));
      onClose();
      setQuantity(1);
    } catch (error) {
      console.error('Failed to consume item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Consume Item</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Item:</p>
          <p className="font-medium text-gray-900">{item.name}</p>
          <p className="text-sm text-gray-500">Available: {item.quantity} {item.unitName}</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity to consume:
          </label>
          <input
            type="number"
            min="1"
            max={item.quantity}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConsume}
            disabled={isLoading || quantity <= 0 || quantity > item.quantity}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            <Minus className="w-4 h-4" />
            {isLoading ? 'Consuming...' : 'Consume'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InventoryList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, error } = useSelector((state) => state.inventory);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [consumeModal, setConsumeModal] = useState({ isOpen: false, item: null });

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
    if (!expiryDate) return "No upcoming expiry";
    const date = new Date(expiryDate);
    const today = new Date();
    const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 3) {
      return `⚠️ ${diffDays === 0 ? 'Today' : `${diffDays} day${diffDays > 1 ? 's' : ''}`}`;
    }
    return date.toLocaleDateString();
  };
  
  const filteredItems = useMemo(() => {
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

    return filtered;
  }, [items, selectedCategory, searchTerm]);

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

      {/* Error */}
      {error && (
        <Alert
          type="error"
          title="Error Loading Inventory"
          message={error}
          className="mb-6"
        />
      )}

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon={<Package className="w-16 h-16 text-gray-400" />}
          title="No inventory items found"
          description={searchTerm ? "Try adjusting your search terms" : "Start by adding some items to your inventory"}
          action={
            <Button onClick={() => navigate("/inventory/add-ocr")}>
              Add First Item
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-all duration-300 ease-out hover:-translate-y-1">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  {getCategoryIcon(item.categoryName)}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openConsumeModal(item)}
                      className="px-2 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 flex items-center gap-1 text-sm"
                    >
                      <Minus className="w-3 h-3" />
                      Consume
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.categoryName}</p>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Quantity:</span>
                    <span className="font-medium">{item.totalQuantity} {item.unitName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Items:</span>
                    <span className="font-medium">{item.itemCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Expires:</span>
                    <span className="text-sm font-medium">{formatExpiryDate(item.earliestExpiry)}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  // onClick={() => navigate(`/inventory/${item.id}`)}
                  onClick={() => navigate(`/inventory/details/${item.id}`)}
                  className="w-full"
                >
                  View Details
                </Button>
              </div>
            </Card>
          ))}
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
