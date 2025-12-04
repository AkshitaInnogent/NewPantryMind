import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchInventoryDetails, deleteInventoryItem } from "../../features/inventory/inventoryThunks";
import { ChevronLeft, Pencil, Trash2, Package2, Layers3, Scale, Boxes } from "lucide-react";

export default function InventoryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadInventoryDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadInventoryDetails = async () => {
    try {
      setLoading(true);
      const data = await dispatch(fetchInventoryDetails(id));
      setInventory(data);
    } catch (err) {
      setError(err?.message || "Failed to load inventory details");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await dispatch(deleteInventoryItem(itemId));
      
      // Check if this was the last item
      if (inventory.items && inventory.items.length === 1) {
        // If it was the last item, redirect to inventory list
        navigate("/inventory");
        return;
      }
      
      // Otherwise, reload the details
      await loadInventoryDetails();
    } catch (err) {
      // If we get a 404, it means the inventory no longer exists, redirect to list
      if (err?.message?.includes("404") || err?.response?.status === 404) {
        navigate("/inventory");
        return;
      }
      setError(err?.message || "Failed to delete item");
    }
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return { key: "no-expiry", label: "No expiry", cls: "bg-gray-100 text-gray-700" };
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { key: "expired", label: "Expired", cls: "bg-red-100 text-red-800" };
    if (diffDays <= 3) return { key: "expiring-soon", label: `Good until ${expiry.toLocaleDateString()}` , cls: "bg-orange-100 text-orange-800" };
    if (diffDays <= 7) return { key: "expiring-week", label: `Good until ${expiry.toLocaleDateString()}` , cls: "bg-yellow-100 text-yellow-800" };
    return { key: "fresh", label: `Good until ${expiry.toLocaleDateString()}`, cls: "bg-green-100 text-green-800" };
  };

  const formatQty = (qty, unitName) => {
    if (!qty && qty !== 0) return "—";
    if (!unitName) return String(qty);
    return `${qty} ${unitName}`;
  };

  const getCategoryIcon = (categoryName) => {
    const category = categoryName?.toLowerCase() || "";
    
    if (category.includes("dairy") || category.includes("milk")) {
      return "🥛";
    }
    
    if (category.includes("vegetable") || category.includes("veggie")) {
      return "🥬";
    }
    
    if (category.includes("fruit")) {
      return "🍎";
    }
    
    if (category.includes("meat") || category.includes("protein")) {
      return "🥩";
    }
    
    if (category.includes("grain") || category.includes("cereal") || category.includes("bread")) {
      return "🍞";
    }
    
    if (category.includes("beverage") || category.includes("drink")) {
      return "🥤";
    }
    
    if (category.includes("snack") || category.includes("candy")) {
      return "🍪";
    }
    
    if (category.includes("frozen")) {
      return "🧊";
    }
    
    if (category.includes("spice") || category.includes("seasoning")) {
      return "🧂";
    }
    
    if (category.includes("oil") || category.includes("condiment")) {
      return "🫒";
    }
    
    // Default icon for uncategorized items
    return "📦";
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  if (!inventory) return <div className="min-h-screen flex items-center justify-center text-gray-600">Inventory not found</div>;

  const totalQtyLabel = `${inventory.totalQuantity ?? 0} ${inventory.unitName ?? ""}`.trim();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/inventory")} className="text-gray-600 hover:text-gray-800 inline-flex items-center justify-center">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center ring-1 ring-red-100">
            <span className="text-2xl">{getCategoryIcon(inventory.categoryName)}</span>
          </div>
          <div>
            <div className="text-sm text-gray-500">Inventory / {inventory.name}</div>
            <h1 className="text-2xl font-bold text-gray-900">{inventory.name}</h1>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="bg-white rounded-2xl shadow p-4 md:p-6 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
              <Package2 className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Category</div>
              <div className="font-semibold text-gray-900">{inventory.categoryName ?? "—"}</div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
              <Scale className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Unit</div>
              <div className="font-semibold text-gray-900">{inventory.unitName ?? "—"}</div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
              <Layers3 className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Quantity</div>
              <div className="font-semibold text-gray-900">{totalQtyLabel}</div>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
              <Boxes className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Individual Items</div>
              <div className="font-semibold text-gray-900">{inventory.items?.length || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Items table */}
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Individual Items</h2>
      {inventory.items?.length ? (
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-sm text-gray-600">
                <tr>
                  <th className="px-6 py-3 font-medium">Description</th>
                  <th className="px-6 py-3 font-medium">Stock Details (Qty)</th>
                  <th className="px-6 py-3 font-medium">Location</th>
                  <th className="px-6 py-3 font-medium">Expiry Date</th>
                  <th className="px-6 py-3 font-medium">Price</th>
                  <th className="px-6 py-3 font-medium">Added By</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inventory.items.map((item, idx) => {
                  const status = getExpiryStatus(item.expiryDate);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/60">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">{item.description || "—"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">{item.quantity ?? "—"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">{item.locationName || "—"}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${status.cls}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">{item.price ? `₹${item.price}` : "Not Set"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">{item.createdByName || "—"}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/inventory/edit-item/${item.id}`, { state: { item } })}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700"
                            aria-label="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm border border-red-200 bg-red-50 hover:bg-red-100 text-red-700"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">
          No individual items found for this inventory.
        </div>
      )}
    </div>
  );
}