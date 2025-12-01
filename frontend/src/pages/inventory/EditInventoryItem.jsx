import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { updateInventoryItem, fetchInventoryItemById } from "../../features/inventory/inventoryThunks";
import { fetchCategories } from "../../features/categories/categoryThunks";
import { fetchUnits } from "../../features/units/unitThunks";

export default function EditInventoryItem() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { categories } = useSelector((state) => state.categories || { categories: [] });
  const { units } = useSelector((state) => state.units || { units: [] });
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    categoryId: "",
    unitId: "",
    quantity: "",
    location: "",
    expiryDate: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const item = await dispatch(fetchInventoryItemById(id)).unwrap();
        setForm({
          name: item.name || "",
          description: item.description || "",
          categoryId: item.categoryId || "",
          unitId: item.unitId || "",
          quantity: item.quantity || "",
          location: item.location || "",
          expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : "",
        });
      } catch (error) {
        console.error("Failed to fetch item:", error);
      }
    };
    
    loadData();
    dispatch(fetchCategories());
    dispatch(fetchUnits());
  }, [dispatch, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const itemData = {
        name: form.name,
        description: form.description || null,
        categoryId: form.categoryId || null,
        unitId: form.unitId || null,
        quantity: parseInt(form.quantity),
        location: form.location || null,
        expiryDate: form.expiryDate || null,
      };
      
      await dispatch(updateInventoryItem(id, itemData)).unwrap();
      navigate("/inventory");
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Item Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
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

              {/* Unit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit
                </label>
                <select
                  name="unitId"
                  value={form.unitId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Unit</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Refrigerator, Pantry"
                />
              </div>
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