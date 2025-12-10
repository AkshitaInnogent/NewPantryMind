import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { X, Minus } from 'lucide-react';
import { manualConsumeItem } from '../../features/inventory/inventoryThunks';

export default function ManualConsumeModal({ item, isOpen, onClose }) {
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
