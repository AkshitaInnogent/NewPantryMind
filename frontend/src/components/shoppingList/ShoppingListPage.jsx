import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import RightSidebar from "../../components/layout/RightSidebar";

const ShoppingList = () => {
  const { user } = useSelector(state => state.auth);
  const { currentKitchen } = useSelector(state => state.kitchen);
  const kitchenId = currentKitchen?.id || user?.kitchenId;
  
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    itemName: '',
    quantity: 1,
    unit: '',
    category: '',
    priority: 'MEDIUM'
  });

  // Debug logging
  console.log('ShoppingList Debug:', { user, currentKitchen, kitchenId });

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...');
      const response = await fetch('http://localhost:8080/api/categories', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('Categories response:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Categories data:', data);
        setCategories(data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchUnits = async () => {
    try {
      console.log('Fetching units...');
      const response = await fetch('http://localhost:8080/api/units', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('Units response:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Units data:', data);
        setUnits(data);
      }
    } catch (err) {
      console.error('Failed to fetch units:', err);
    }
  };

  const fetchItems = async () => {
    if (!kitchenId) {
      console.log('No kitchenId available');
      return;
    }
    setLoading(true);
    try {
      console.log('Fetching shopping list items for kitchen:', kitchenId);
      const response = await fetch(`http://localhost:8080/api/shopping-list?kitchenId=${kitchenId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('Shopping list response:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Shopping list data:', data);
        setItems(data);
        setError(null);
      } else {
        const errorText = await response.text();
        console.error('Shopping list error:', errorText);
        setError(`Failed to fetch items: ${response.status}`);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch items');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
    fetchCategories();
    fetchUnits();
  }, [kitchenId]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!kitchenId || !newItem.itemName.trim()) {
      console.log('Missing kitchenId or itemName');
      return;
    }
    
    try {
      console.log('Adding item:', { ...newItem, kitchenId });
      const response = await fetch('http://localhost:8080/api/shopping-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...newItem, kitchenId })
      });
      
      console.log('Add item response:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Item added:', result);
        setNewItem({ itemName: '', quantity: 1, unit: '', category: '', priority: 'MEDIUM' });
        setShowAddForm(false);
        fetchItems();
      } else {
        const errorText = await response.text();
        console.error('Add item error:', errorText);
        alert(`Failed to add item: ${response.status}`);
      }
    } catch (err) {
      console.error('Add error:', err);
      alert('Failed to add item');
    }
  };

  const handleGenerateFromLowStock = async () => {
    if (!kitchenId) return;
    try {
      console.log('Generating from low stock...');
      const response = await fetch('http://localhost:8080/api/shopping-list/generate-from-low-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ kitchenId, threshold: 3 })
      });
      
      console.log('Generate response:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Generated items:', result);
        alert(`Generated ${result.itemsGenerated} items from low stock!`);
        fetchItems();
      } else {
        const errorText = await response.text();
        console.error('Generate error:', errorText);
        alert(`Failed to generate items: ${response.status}`);
      }
    } catch (err) {
      console.error('Generate error:', err);
      alert('Failed to generate items');
    }
  };

  const handleTogglePurchased = async (itemId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/shopping-list/${itemId}/toggle-purchased`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        fetchItems();
      }
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/shopping-list/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        fetchItems();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleClearPurchased = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/shopping-list/clear-purchased?kitchenId=${kitchenId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        fetchItems();
      }
    } catch (err) {
      console.error('Clear error:', err);
    }
  };

  const groupedItems = {
    HIGH: items.filter(item => item.priority === 'HIGH' && !item.isPurchased),
    MEDIUM: items.filter(item => item.priority === 'MEDIUM' && !item.isPurchased),
    LOW: items.filter(item => item.priority === 'LOW' && !item.isPurchased),
    PURCHASED: items.filter(item => item.isPurchased)
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="flex-1 p-6">
        <div className="text-center p-8">Loading shopping list...</div>
      </div>
      <RightSidebar />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="flex-1 p-6">
        <div className="bg-white rounded-lg shadow p-6">
          {/* Debug Info */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
            <strong>Debug:</strong> KitchenId: {kitchenId || 'None'} | 
            Items: {items.length} | 
            Categories: {categories.length} | 
            Units: {units.length}
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-3xl font-bold text-gray-800">🛒 Shopping List</h1>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={handleGenerateFromLowStock}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Generate from Low Stock
              </button>
              <button 
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Add Item
              </button>
              {groupedItems.PURCHASED.length > 0 && (
                <button 
                  onClick={handleClearPurchased}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Clear Purchased
                </button>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Add Item Form */}
          {showAddForm && (
            <div className="mb-6 p-6 bg-gray-50 border border-gray-200 rounded-lg">
              <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <input
                  type="text"
                  placeholder="Item name"
                  value={newItem.itemName}
                  onChange={(e) => setNewItem({...newItem, itemName: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 1})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={newItem.unit}
                  onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Unit</option>
                  {units.map(unit => (
                    <option key={unit.id} value={unit.name}>{unit.name}</option>
                  ))}
                </select>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>{category.name}</option>
                  ))}
                </select>
                <select
                  value={newItem.priority}
                  onChange={(e) => setNewItem({...newItem, priority: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="LOW">Low Priority</option>
                </select>
                <div className="flex gap-2 md:col-span-5">
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    disabled={!newItem.itemName.trim()}
                  >
                    Add Item
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Rest of the component remains the same... */}
          <div className="space-y-6">
            {/* High Priority */}
            {groupedItems.HIGH.length > 0 && (
              <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-red-700 mb-4">
                  🔴 High Priority ({groupedItems.HIGH.length})
                </h3>
                <div className="space-y-2">
                  {groupedItems.HIGH.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{item.itemName}</div>
                        <div className="text-sm text-gray-600">
                          {item.quantity} {item.unit} {item.category && `• ${item.category}`}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleTogglePurchased(item.id)}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                        >
                          ✓ Done
                        </button>
                        <button 
                          onClick={() => handleDeleteItem(item.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        >
                          ✕ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Medium Priority */}
            {groupedItems.MEDIUM.length > 0 && (
              <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-700 mb-4">
                  🟡 Medium Priority ({groupedItems.MEDIUM.length})
                </h3>
                <div className="space-y-2">
                  {groupedItems.MEDIUM.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{item.itemName}</div>
                        <div className="text-sm text-gray-600">
                          {item.quantity} {item.unit} {item.category && `• ${item.category}`}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleTogglePurchased(item.id)}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                        >
                          ✓ Done
                        </button>
                        <button 
                          onClick={() => handleDeleteItem(item.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        >
                          ✕ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Low Priority */}
            {groupedItems.LOW.length > 0 && (
              <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-700 mb-4">
                  🟢 Low Priority ({groupedItems.LOW.length})
                </h3>
                <div className="space-y-2">
                  {groupedItems.LOW.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{item.itemName}</div>
                        <div className="text-sm text-gray-600">
                          {item.quantity} {item.unit} {item.category && `• ${item.category}`}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleTogglePurchased(item.id)}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                        >
                          ✓ Done
                        </button>
                        <button 
                          onClick={() => handleDeleteItem(item.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        >
                          ✕ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Purchased Items */}
            {groupedItems.PURCHASED.length > 0 && (
              <div className="border-l-4 border-gray-500 bg-gray-50 p-4 rounded-lg opacity-75">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  ✅ Purchased ({groupedItems.PURCHASED.length})
                </h3>
                <div className="space-y-2">
                  {groupedItems.PURCHASED.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-600 line-through">{item.itemName}</div>
                        <div className="text-sm text-gray-500">
                          {item.quantity} {item.unit}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleTogglePurchased(item.id)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        ↶ Undo
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {items.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🛒</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Your shopping list is empty</h3>
                <p className="text-gray-500 mb-4">Add items manually or generate from low stock inventory</p>
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Add Your First Item
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <RightSidebar />
    </div>
  );
};

export default ShoppingList;
