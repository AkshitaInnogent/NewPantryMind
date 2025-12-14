import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { updateInventoryItem, fetchInventoryItemById, fetchInventoryDetails } from "../../features/inventory/inventoryThunks";
import { fetchCategories } from "../../features/categories/categoryThunks";
import { fetchLocations } from "../../features/locations/locationThunks";
import { formatDateForInput } from "../../utils/dateUtils";
import { showToast } from "../../utils/toast";

export default function EditInventoryItem() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();


  const { locations } = useSelector((state) => state.locations || { locations: [] });
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    categoryName: "",
    unitName: "",
    quantity: "",
    locationId: "",
    expiryDate: "",
    price: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const stateItem = location.state?.item;
        
        let item;
        if (stateItem) {
          item = stateItem;
        } else {
          item = await dispatch(fetchInventoryItemById(id));
        }
        
        const inventory = await dispatch(fetchInventoryDetails(item.inventoryId));
        
        console.log('Item data:', item);
        console.log('Inventory data:', inventory);
        
        setForm({
          name: inventory.name || item.name || "",
          description: item.description || "",
          categoryName: inventory.categoryName || item.categoryName || "",
          unitName: inventory.unitName || item.unitName || "",
          quantity: item.quantity || item.currentQuantity || inventory.totalQuantity || "",
          locationId: item.locationId || "",
          expiryDate: formatDateForInput(item.expiryDate),
          price: item.price || "",
        });
      } catch (error) {
        console.error("Failed to load item data:", error);
      }
    };
    
    loadData();
    dispatch(fetchCategories());
    dispatch(fetchLocations());
  }, [dispatch, id, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const itemData = {
        description: form.description || null,
        quantity: parseInt(form.quantity),
        locationId: form.locationId || null,
        expiryDate: form.expiryDate || null,
        price: parseFloat(form.price) || null,
      };
      
      await dispatch(updateInventoryItem(id, itemData));
      showToast.success('Item updated successfully!');
      const stateItem = location.state?.item;
      const inventoryId = stateItem?.inventoryId;
      if (inventoryId) {
        navigate(`/inventory/details/${inventoryId}`);
      } else {
        navigate('/inventory');
      }
    } catch (error) {
      console.error("Failed to update item:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-2xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Edit Inventory Item</h1>
            <button
              onClick={() => navigate("/inventory")}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Inventory
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Item Name (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Name
              </label>
              <input
                type="text"
                value={form.name}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Category (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input
                type="text"
                value={form.categoryName}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Stock Details (Qty) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Details (Qty) *
              </label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Unit (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit
              </label>
              <input
                type="text"
                value={form.unitName}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <input
                type="date"
                name="expiryDate"
                value={form.expiryDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <select
                name="locationId"
                value={form.locationId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select Location</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="₹0.00"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Additional notes about the item..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate("/inventory")}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 rounded-lg text-white font-medium ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {loading ? "Updating..." : "Update Item"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}