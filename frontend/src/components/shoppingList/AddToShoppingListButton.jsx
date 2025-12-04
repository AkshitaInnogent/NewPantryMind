import React, { useState } from 'react';
import { useSelector } from 'react-redux';

const AddToShoppingListButton = ({ inventoryItem, className = '' }) => {
  const { user } = useSelector(state => state.auth);
  const { currentKitchen } = useSelector(state => state.kitchen);
  const [loading, setLoading] = useState(false);
  
  const kitchenId = currentKitchen?.id || user?.kitchenId;

  const handleAddToShoppingList = async () => {
    if (!kitchenId || loading) return;
    
    setLoading(true);
    try {
      const shoppingItem = {
        kitchenId,
        itemName: inventoryItem.name || inventoryItem.description,
        quantity: 1,
        unit: inventoryItem.unit?.name || '',
        category: inventoryItem.category?.name || '',
        priority: inventoryItem.quantity === 0 ? 'HIGH' : 'MEDIUM'
      };

      const response = await fetch('http://localhost:8080/api/shopping-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(shoppingItem)
      });

      if (response.ok) {
        alert('Item added to shopping list!');
      } else {
        alert('Failed to add item to shopping list');
      }
    } catch (error) {
      console.error('Error adding to shopping list:', error);
      alert('Failed to add item to shopping list');
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={handleAddToShoppingList}
      disabled={loading}
      className={`px-3 py-1.5 bg-cyan-500 text-white text-xs rounded-md hover:bg-cyan-600 transition-colors font-medium flex items-center gap-1 disabled:opacity-50 ${className}`}
      title="Add to shopping list"
    >
      🛒 {loading ? 'Adding...' : 'Add to List'}
    </button>
  );
};

export default AddToShoppingListButton;
