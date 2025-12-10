// Create BulkOperations.jsx component
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button , Card } from '../ui';
import { Check, Plus, ShoppingCart } from 'lucide-react';
import { addAllLowStockItems, addSelectedItems, getLowStockItems } from '../../features/shopping/shoppingThunks';

export function BulkOperations({ currentListId, kitchenId }) {
  const dispatch = useDispatch();
  const { lowStockItems } = useSelector(state => state.shopping);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showLowStock, setShowLowStock] = useState(false);

  useEffect(() => {
    if (showLowStock && kitchenId) {
      dispatch(getLowStockItems(kitchenId));
    }
  }, [showLowStock, kitchenId, dispatch]);

  const handleAddAllLowStock = () => {
    if (currentListId && kitchenId) {
      dispatch(addAllLowStockItems({ listId: currentListId, kitchenId }));
    }
  };

  const handleAddSelected = () => {
    if (currentListId && selectedItems.length > 0) {
      dispatch(addSelectedItems({ listId: currentListId, itemNames: selectedItems }));
      setSelectedItems([]);
    }
  };

  const toggleItemSelection = (itemName) => {
    setSelectedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  return (
    <Card className="p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Quick Add Options</h3>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleAddAllLowStock} className="bg-orange-500 hover:bg-orange-600">
            <Plus className="w-4 h-4 mr-1" />
            Add All Low Stock
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowLowStock(!showLowStock)}>
            {showLowStock ? 'Hide' : 'Show'} Low Stock Items
          </Button>
        </div>
      </div>

      {showLowStock && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {lowStockItems?.length || 0} low-stock items found
            </span>
            {selectedItems.length > 0 && (
              <Button size="sm" onClick={handleAddSelected}>
                Add Selected ({selectedItems.length})
              </Button>
            )}
          </div>
          
          <div className="max-h-60 overflow-y-auto space-y-1">
            {lowStockItems?.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleItemSelection(item.name)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selectedItems.includes(item.name) 
                        ? 'bg-blue-500 border-blue-500 text-white' 
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedItems.includes(item.name) && <Check className="w-3 h-3" />}
                  </button>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-sm text-gray-500">
                    ({item.currentStock} {item.unit} remaining)
                  </span>
                </div>
                <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                  Low Stock
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
