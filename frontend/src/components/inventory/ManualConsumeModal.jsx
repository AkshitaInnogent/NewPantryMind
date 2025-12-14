import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { X, Clock, User } from 'lucide-react';
import { manualConsumeItem, getConsumptionInfo } from '../../features/inventory/inventoryThunks';
import { showToast } from '../../utils/toast';
import { showAlert } from '../../utils/sweetAlert';

export default function ManualConsumeModal({ item, isOpen, onClose, onSuccess }) {
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [consumptionInfo, setConsumptionInfo] = useState(null);
  const [consumptionResult, setConsumptionResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [consumptionPreview, setConsumptionPreview] = useState([]);

  useEffect(() => {
    if (isOpen && item) {
      fetchConsumptionInfo();
      setShowResult(false);
      setConsumptionResult(null);
      setShowPreview(false);
      setConsumptionPreview([]);
      setQuantity('');
    }
  }, [isOpen, item]);

  const calculateConsumptionPreview = (requestedQuantity) => {
    if (!consumptionInfo || requestedQuantity <= 0) return [];

    let remainingToConsume = requestedQuantity;
    const preview = [];

    for (const availableItem of consumptionInfo.availableItems) {
      if (remainingToConsume <= 0) break;

      const toConsumeFromThis = Math.min(remainingToConsume, availableItem.quantity);
      const remainingAfter = availableItem.quantity - toConsumeFromThis;

      preview.push({
        ...availableItem,
        willConsume: toConsumeFromThis,
        willRemain: remainingAfter
      });

      remainingToConsume -= toConsumeFromThis;
    }

    return preview;
  };

  const handleQuantityChange = (value) => {
    setQuantity(value);
    const numValue = Number(value);
    if (numValue > 0 && consumptionInfo) {
      const preview = calculateConsumptionPreview(numValue);
      setConsumptionPreview(preview);
      setShowPreview(true);
    } else {
      setShowPreview(false);
    }
  };

  const fetchConsumptionInfo = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/inventory/${item.id}/consumption-info`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Consumption info:', data);
      setConsumptionInfo(data);
    } catch (error) {
      console.error('Failed to fetch consumption info:', error);
      // Set fallback data
      setConsumptionInfo({
        totalAvailable: item.quantity || item.totalQuantity || 0,
        unit: item.unitName || 'units',
        availableItems: []
      });
    }
  };

  const handleConsume = async () => {
    const numQuantity = Number(quantity);
    if (numQuantity <= 0 || (consumptionInfo && numQuantity > consumptionInfo.totalAvailable)) return;
    
    const result = await showAlert.confirm(
      'Consume Item',
      `Are you sure you want to consume ${quantity} ${item.unitName} of ${item.name}?`,
      'Yes, consume it!'
    );

    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        await dispatch(manualConsumeItem(item.id, quantity));
        showToast.success(`Successfully consumed ${quantity} ${item.unitName} of ${item.name}`);
        onClose();
        setQuantity(1);
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        showToast.error('Failed to consume item. Please try again.');
        console.error('Failed to consume item:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClose = () => {
    setShowResult(false);
    setConsumptionResult(null);
    setShowPreview(false);
    setConsumptionPreview([]);
    onClose();
  };

  if (!isOpen || !item) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-gray-200 p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Consume Item</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {showResult && consumptionResult ? (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Consumption Details:</h4>
            {consumptionResult.consumedItems.map((consumedItem, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{consumedItem.itemName}</span>
                  <span className="text-sm text-gray-600">
                    {consumedItem.totalConsumed} {consumedItem.unit} consumed
                  </span>
                </div>
                <div className="space-y-2">
                  {consumedItem.itemDetails.map((detail, detailIndex) => (
                    <div key={detailIndex} className="bg-white rounded p-3 border-l-4 border-red-400">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <Clock className="w-4 h-4" />
                            <span>Expires: {new Date(detail.expiryDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4" />
                            <span>Added by: {detail.addedByName}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-red-600">
                            -{detail.quantityConsumed} {consumedItem.unit}
                          </div>
                          <div className="text-xs text-gray-500">
                            Remaining: {detail.remainingQuantity} {consumedItem.unit}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Item:</p>
              <p className="font-medium text-gray-900">{item.name}</p>
              {consumptionInfo && (
                <p className="text-sm text-gray-500 mb-2">
                  Available: {consumptionInfo.totalAvailable} {consumptionInfo.unit}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity to consume ({consumptionInfo?.unit || 'units'}):
              </label>
              <input
                type="number"
                min="1"
                max={consumptionInfo?.totalAvailable || item.quantity}
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                placeholder="Enter quantity"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {Number(quantity) > 0 && consumptionInfo && Number(quantity) > consumptionInfo.totalAvailable && (
                <p className="text-red-500 text-sm mt-1">
                  Quantity exceeds available amount ({consumptionInfo.totalAvailable} {consumptionInfo.unit})
                </p>
              )}
            </div>

            {showPreview && consumptionPreview.length > 0 && (
              <div className="mb-4 bg-yellow-50 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-3">Consumption Preview:</h4>
                <div className="space-y-2">
                  {consumptionPreview.map((previewItem, index) => (
                    <div key={index} className="bg-white rounded p-3 border-l-4 border-yellow-400">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <Clock className="w-4 h-4" />
                            <span>Expires: {new Date(previewItem.expiryDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4" />
                            <span>Added by: {previewItem.addedByName}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-yellow-700">
                            Will use: {previewItem.willConsume} {consumptionInfo.unit}
                          </div>
                          <div className="text-xs text-gray-500">
                            Will remain: {previewItem.willRemain} {consumptionInfo.unit}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            {showResult ? 'Close' : 'Cancel'}
          </button>
          {!showResult && (
            <button
              onClick={handleConsume}
              disabled={isLoading || Number(quantity) <= 0 || (consumptionInfo && Number(quantity) > consumptionInfo.totalAvailable)}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              {isLoading ? 'Using...' : 'Use'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}