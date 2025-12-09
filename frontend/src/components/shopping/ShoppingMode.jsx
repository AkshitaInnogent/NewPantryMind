// Create ShoppingMode.jsx for better purchase experience
import React from 'react';
import { useDispatch } from 'react-redux';
import { Button } from '../ui';
import { Check, ShoppingCart } from 'lucide-react';
import { markAsPurchased } from '../../features/shopping/shoppingThunks';

export function ShoppingMode({ items, onClose }) {
  const dispatch = useDispatch();

  const handleMarkPurchased = (itemId, suggestedQuantity) => {
    dispatch(markAsPurchased({ 
      itemId, 
      actualQuantity: suggestedQuantity 
    }));
  };

  const pendingItems = items?.filter(item => item.status === 'PENDING') || [];
  const purchasedItems = items?.filter(item => item.status === 'PURCHASED') || [];

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Shopping Mode</h2>
          <p className="text-sm text-gray-600">
            {pendingItems.length} items remaining
          </p>
        </div>
        <Button variant="outline" onClick={onClose}>Exit Shopping Mode</Button>
      </div>

      <div className="p-4 space-y-4">
        {/* Pending Items */}
        <div>
          <h3 className="font-semibold mb-3 text-gray-800">Items to Buy</h3>
          <div className="space-y-2">
            {pendingItems.map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm">
                <div>
                  <span className="font-medium text-lg">{item.canonicalName}</span>
                  {item.suggestedQuantity && (
                    <div className="text-sm text-gray-600">
                      Suggested: {item.suggestedQuantity} {item.unitName || 'units'}
                    </div>
                  )}
                </div>
                <Button
                  size="lg"
                  onClick={() => handleMarkPurchased(item.id, item.suggestedQuantity)}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Got It!
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Purchased Items */}
        {purchasedItems.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 text-gray-600">Completed ({purchasedItems.length})</h3>
            <div className="space-y-1">
              {purchasedItems.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-2 bg-green-50 rounded">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600 line-through">{item.canonicalName}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {pendingItems.length === 0 && (
          <div className="text-center py-8">
            <ShoppingCart className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h3 className="text-xl font-semibold text-green-600 mb-2">Shopping Complete!</h3>
            <p className="text-gray-600 mb-4">All items have been purchased</p>
            <Button onClick={onClose} className="bg-green-500 hover:bg-green-600">
              Finish Shopping
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
