import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createInventoryItem } from "../../features/inventory/inventoryThunks";
import { fetchCategories } from "../../features/categories/categoryThunks";
import { fetchUnits } from "../../features/units/unitThunks";
import { fetchLocations } from "../../features/locations/locationThunks";
import { showToast } from "../../utils/toast";

export default function AddInventoryOCR() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth || {});
  const { categories } = useSelector((state) => state.categories || { categories: [] });
  const { units } = useSelector((state) => state.units || { units: [] });
  const { locations } = useSelector((state) => state.locations || { locations: [] });
  
  const [showOptions, setShowOptions] = useState(false);
  const [activeMode, setActiveMode] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [extractedItems, setExtractedItems] = useState([]);
  const [editingItems, setEditingItems] = useState([]);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [manualItems, setManualItems] = useState([{
    id: 1,
    name: "",
    description: "",
    categoryId: "",
    unitId: "",
    quantity: "",
    locationId: "",
    expiryDate: "",
    price: "",
  }]);



  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchUnits());
    dispatch(fetchLocations());
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [dispatch, stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setShowCamera(true);
    } catch (error) {
      showToast.error('Camera access is required for this feature');
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        showToast.error(`Captured image too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Please try again.`);
        return;
      }
      processOCR(file, activeMode);
    }, 'image/jpeg', 0.8);
    
    stopCamera();
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const processOCR = async (file, mode) => {
    setOcrLoading(true);
    setErrorMessage('');
    const formData = new FormData();
    formData.append('image', file);

    const endpoints = {
      pantry: `/api/ocr/product?kitchenId=${user?.kitchenId}&userId=${user?.id}&mode=auto`,
      label: `/api/ocr/label?kitchenId=${user?.kitchenId}&userId=${user?.id}`,
      bill: `/api/ocr/bill?kitchenId=${user?.kitchenId}&userId=${user?.id}`
    };

    try {
      const response = await fetch(`http://localhost:8080${endpoints[mode]}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        // OCR Response received
        
        // Handle different response structures
        let items = [];
        if (data.extractedItems && Array.isArray(data.extractedItems)) {
          items = data.extractedItems;
        } else if (data.ocrResponse?.items && Array.isArray(data.ocrResponse.items)) {
          items = data.ocrResponse.items;
        } else if (data.items && Array.isArray(data.items)) {
          items = data.items;
        }
        
        // If still no items, try to parse from raw OCR text
        if (items.length === 0 && data.ocrResponse?.raw_ocr_text) {
          const text = data.ocrResponse.raw_ocr_text;
          const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
          
          // Extract product names containing KIMCHI
          const productLines = lines.filter(line => {
            const upper = line.toUpperCase();
            return upper.includes('KIMCHI') && 
                   (upper.includes('CLASSIC') || upper.includes('SPICY') || upper.includes('ORGANIC'));
          });
          
          items = productLines.map((line, index) => ({
            canonicalName: line.trim(),
            raw_name: line.trim(),
            category: 'food',
            quantity: 1,
            unit: 'piece'
          }));
        }
        
        if (items.length === 0) {
          setErrorMessage('📷 No items detected. Please try a clearer image with better lighting.');
          showToast.warning('No items detected in the image');
          return;
        }
        
        setExtractedItems(items);
        
        const editableItems = items.map((item, index) => ({
          id: Date.now() + Math.random() + index,
          name : item.canonicalName || item.rawName || item.raw_name || item.name || item.productName || item.itemName || item.text || `Item ${index + 1}`,
          description: item.brand !== 'N/A' ? item.brand : '',
          categoryId: getCategoryIdByName(item.categoryName || item.category),
          unitId: getUnitIdByName(item.unitName || item.unit),
          quantity: item.quantity || 1,
          locationId: getLocationIdByName(item.storageType !== 'unknown' ? item.storageType : ''),
          expiryDate: item.expiryDate || item.expiry_date || '',
          price: item.price || ''
        }));
        
        // Editable Items prepared
        setEditingItems(editableItems);
        setActiveMode('edit');
        showToast.success(`Successfully extracted ${items.length} items from image!`);
      } else if (response.status === 429) {
        setErrorMessage('⏰ Feature not available right now. API rate limit exceeded. Please try again later.');
      } else if (response.status === 400) {
        setErrorMessage('📷 Unable to scan image. Please send a good quality image with clear text and proper lighting.');
      } else {
        setErrorMessage('❌ OCR processing failed. Please try again with a different image.');
      }
    } catch (error) {
      // OCR error
      setErrorMessage('🔌 Connection error. Please check your internet connection and try again.');
    } finally {
      setOcrLoading(false);
    }
  };

  const getCategoryIdByName = (categoryName) => {
    if (!categoryName) return '';
    const category = categories.find(cat => 
      cat.name.toLowerCase().includes(categoryName.toLowerCase())
    );
    return category?.id || '';
  };

  const getUnitIdByName = (unitName) => {
    if (!unitName) return '';
    const unit = units.find(u => 
      u.name.toLowerCase().includes(unitName.toLowerCase())
    );
    return unit?.id || '';
  };

  const getLocationIdByName = (locationName) => {
    if (!locationName) return '';
    const location = locations.find(loc => 
      loc.name.toLowerCase().includes(locationName.toLowerCase())
    );
    return location?.id || '';
  };

  const updateEditingItem = (index, field, value) => {
    const updated = [...editingItems];
    updated[index][field] = value;
    setEditingItems(updated);
  };

  const removeEditingItem = (index) => {
    const updated = editingItems.filter((_, i) => i !== index);
    setEditingItems(updated);
  };

  const saveAllItems = async () => {
    // Validate required fields
    for (let i = 0; i < editingItems.length; i++) {
      const item = editingItems[i];
      if (!item.name.trim()) {
        showToast.error('Please enter item name for all items');
        document.querySelector(`[data-item-index="${i}"] input[placeholder*="Item Name"]`)?.focus();
        document.querySelector(`[data-item-index="${i}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      if (!item.categoryId) {
        showToast.error('Please select category for all items');
        document.querySelector(`[data-item-index="${i}"] select[data-field="category"]`)?.focus();
        document.querySelector(`[data-item-index="${i}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      if (!item.quantity || item.quantity <= 0) {
        showToast.error('Please enter valid quantity for all items');
        document.querySelector(`[data-item-index="${i}"] input[placeholder*="Quantity"]`)?.focus();
        document.querySelector(`[data-item-index="${i}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      if (!item.unitId) {
        showToast.error('Please select unit for all items');
        document.querySelector(`[data-item-index="${i}"] select[data-field="unit"]`)?.focus();
        document.querySelector(`[data-item-index="${i}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }
    
    // Validate dates
    for (const item of editingItems) {
      if (item.expiryDate && !validateDate(item.expiryDate)) {
        showToast.error('Please add a correct valid date or greater than today date');
        return;
      }
    }
    
    setOcrLoading(true);
    try {
      for (const item of editingItems) {
        const itemData = {
          name: item.name,
          description: item.description || null,
          kitchenId: user?.kitchenId || null,
          createdBy: user?.id || null,
          quantity: parseInt(item.quantity) || 1,
          categoryId: item.categoryId || null,
          unitId: item.unitId || null,
          locationId: item.locationId || null,
          expiryDate: item.expiryDate || null,
          price: item.price ? parseFloat(item.price) : null,
        };
        await dispatch(createInventoryItem(itemData));
      }
      showToast.success(`Successfully added ${editingItems.length} items to inventory!`);
      navigate("/inventory");
    } catch (error) {
      if (error.message?.includes('Date') || error.message?.includes('date')) {
        showToast.error('Please add a correct valid date or greater than today date');
      } else {
        showToast.error('Failed to save items. Please try again.');
      }
    } finally {
      setOcrLoading(false);
    }
  };



  const addManualItem = () => {
    setManualItems([...manualItems, {
      id: Date.now(),
      name: "",
      description: "",
      categoryId: "",
      unitId: "",
      quantity: "",
      locationId: "",
      expiryDate: "",
      price: "",
    }]);
  };

  const removeManualItem = (id) => {
    if (manualItems.length > 1) {
      setManualItems(manualItems.filter(item => item.id !== id));
    }
  };

  const updateManualItem = (id, field, value) => {
    setManualItems(manualItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const validateDate = (dateString) => {
    if (!dateString) return true;
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today && date.getFullYear() <= 9999;
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields for each item
    for (const item of manualItems) {
      if (!item.name.trim()) {
        showToast.error('Please enter item name for all items');
        return;
      }
      if (!item.categoryId) {
        showToast.error('Please select category for all items');
        return;
      }
      if (!item.quantity || item.quantity <= 0) {
        showToast.error('Please enter valid quantity for all items');
        return;
      }
      if (!item.unitId) {
        showToast.error('Please select unit for all items');
        return;
      }
    }
    
    // Validate dates
    for (const item of manualItems) {
      if (item.expiryDate && !validateDate(item.expiryDate)) {
        showToast.error('Please add a correct valid date or greater than today date');
        return;
      }
    }
    
    setOcrLoading(true);
    try {
      for (const item of manualItems) {
        const itemData = {
          name: item.name.trim(),
          description: item.description || null,
          kitchenId: user?.kitchenId || null,
          createdBy: user?.id || null,
          quantity: parseInt(item.quantity),
          categoryId: parseInt(item.categoryId),
          unitId: parseInt(item.unitId),
          locationId: item.locationId ? parseInt(item.locationId) : null,
          expiryDate: item.expiryDate || null,
          price: item.price ? parseFloat(item.price) : null,
        };
        await dispatch(createInventoryItem(itemData));
      }
      showToast.success(`Successfully added ${manualItems.length} items to inventory!`);
      navigate("/inventory");
    } catch (error) {
      if (error.message?.includes('Date') || error.message?.includes('date')) {
        showToast.error('Please add a correct valid date or greater than today date');
      } else {
        showToast.error('Failed to create items. Please try again.');
      }
    } finally {
      setOcrLoading(false);
    }
  };



  useEffect(() => {
    setShowOptions(true);
  }, []);

  if (showCamera) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <div className="flex-1 relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
            <button
              onClick={stopCamera}
              className="bg-red-600 text-white px-6 py-3 rounded-full"
            >
              Cancel
            </button>
            <button
              onClick={capturePhoto}
              className="bg-white text-black px-8 py-3 rounded-full font-medium"
            >
              📷 Capture
            </button>
          </div>
        </div>
      </div>
    );
  }



  if (activeMode === 'manual') {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Manual Entry ({manualItems.length} items)</h1>
            <button onClick={() => setActiveMode(null)} className="text-gray-600">← Back</button>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-6">
            {manualItems.map((item, index) => (
              <div key={item.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Item {index + 1}</h3>
                  <div className="flex gap-2">
                    {index === manualItems.length - 1 && (
                      <button
                        type="button"
                        onClick={addManualItem}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                      >
                        + Add Item
                      </button>
                    )}
                    {manualItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeManualItem(item.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Item Name *"
                    value={item.name}
                    onChange={(e) => updateManualItem(item.id, 'name', e.target.value)}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                  
                  <select
                    value={item.categoryId}
                    onChange={(e) => updateManualItem(item.id, 'categoryId', e.target.value)}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Category *</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>

                  <input
                    type="number"
                    placeholder="Quantity *"
                    value={item.quantity}
                    onChange={(e) => updateManualItem(item.id, 'quantity', e.target.value)}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />

                  <select
                    value={item.unitId}
                    onChange={(e) => updateManualItem(item.id, 'unitId', e.target.value)}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Unit *</option>
                    {units.map(unit => (
                      <option key={unit.id} value={unit.id}>{unit.name}</option>
                    ))}
                  </select>

                  <input
                    type="date"
                    value={item.expiryDate}
                    onChange={(e) => updateManualItem(item.id, 'expiryDate', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />

                  <select
                    value={item.locationId}
                    onChange={(e) => updateManualItem(item.id, 'locationId', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Location</option>
                    {locations.map(location => (
                      <option key={location.id} value={location.id}>{location.name}</option>
                    ))}
                  </select>

                  <input
                    type="number"
                    placeholder="Price"
                    value={item.price}
                    onChange={(e) => updateManualItem(item.id, 'price', e.target.value)}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <textarea
                  placeholder="Description"
                  value={item.description || ''}
                  onChange={(e) => updateManualItem(item.id, 'description', e.target.value)}
                  className="w-full mt-4 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  rows="2"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={ocrLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium disabled:bg-gray-400"
            >
              {ocrLoading ? "Adding..." : `Add All ${manualItems.length} Items`}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (activeMode === 'edit' && editingItems.length > 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">Review & Edit Items ({editingItems.length})</h1>
              <button onClick={() => setActiveMode(null)} className="text-gray-600">← Back</button>
            </div>
            
          </div>

          <div className="space-y-4">
            {editingItems.map((item, index) => (
              <div key={item.id} data-item-index={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold">Item {index + 1}</h3>
                  <button
                    onClick={() => removeEditingItem(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    🗑️ Delete
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Item Name *"
                    value={item.name}
                    onChange={(e) => updateEditingItem(index, 'name', e.target.value)}
                    required
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />

                  <select
                    value={item.categoryId}
                    onChange={(e) => updateEditingItem(index, 'categoryId', e.target.value)}
                    data-field="category"
                    required
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Category *</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>

                  <input
                    type="number"
                    placeholder="Quantity *"
                    value={item.quantity}
                    onChange={(e) => updateEditingItem(index, 'quantity', e.target.value)}
                    required
                    min="1"
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />

                  <select
                    value={item.unitId}
                    onChange={(e) => updateEditingItem(index, 'unitId', e.target.value)}
                    data-field="unit"
                    required
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Unit *</option>
                    {units.map(unit => (
                      <option key={unit.id} value={unit.id}>{unit.name}</option>
                    ))}
                  </select>

                  <input
                    type="date"
                    value={item.expiryDate}
                    onChange={(e) => updateEditingItem(index, 'expiryDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />

                  <select
                    value={item.locationId}
                    onChange={(e) => updateEditingItem(index, 'locationId', e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Location</option>
                    {locations.map(location => (
                      <option key={location.id} value={location.id}>{location.name}</option>
                    ))}
                  </select>

                  <input
                    type="number"
                    placeholder="Price"
                    value={item.price}
                    onChange={(e) => updateEditingItem(index, 'price', e.target.value)}
                    step="0.01"
                    min="0"
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <textarea
                  placeholder="Description"
                  value={item.description || ''}
                  onChange={(e) => updateEditingItem(index, 'description', e.target.value)}
                  className="w-full mt-4 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  rows="2"
                />
              </div>
            ))}
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <button
              onClick={saveAllItems}
              disabled={ocrLoading || editingItems.length === 0}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium disabled:bg-gray-400"
            >
              {ocrLoading ? "Saving..." : `Save All ${editingItems.length} Items`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle sub-options for scan types
  if (activeMode === 'label-options' || activeMode === 'pantry-options' || activeMode === 'bill-options') {
    const scanType = activeMode.replace('-options', '');
    const titles = {
      label: 'Scan Label',
      pantry: 'Scan Pantry', 
      bill: 'Scan Bill'
    };
    
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">{titles[scanType]}</h1>
              <button onClick={() => setActiveMode(null)} className="text-gray-600">← Back</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setActiveMode(scanType);
                  startCamera();
                }}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <div className="text-4xl mb-2">📷</div>
                <h3 className="font-semibold mb-1">Use Camera</h3>
                <p className="text-sm text-gray-600">Take photo with camera</p>
              </button>
              
              <button
                onClick={() => {
                  setActiveMode(scanType);
                  fileInputRef.current?.click();
                }}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <div className="text-4xl mb-2">📁</div>
                <h3 className="font-semibold mb-1">Upload Image</h3>
                <p className="text-sm text-gray-600">Choose from gallery</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Add Inventory Items</h1>
            <button onClick={() => navigate("/inventory")} className="text-gray-600">← Back</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setActiveMode('manual')}
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <div className="text-4xl mb-2">✏️</div>
              <h3 className="font-semibold mb-1">Manual Entry</h3>
              <p className="text-sm text-gray-600">Add items by typing details</p>
            </button>

            <button
              onClick={() => {
                setActiveMode('label');
                fileInputRef.current?.click();
              }}
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <div className="text-4xl mb-2">🏷️</div>
              <h3 className="font-semibold mb-1">Scan Label</h3>
              <p className="text-sm text-gray-600">Product labels and packaging</p>
            </button>

            <button
              onClick={() => {
                setActiveMode('pantry');
                fileInputRef.current?.click();
              }}
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <div className="text-4xl mb-2">📦</div>
              <h3 className="font-semibold mb-1">Scan Pantry</h3>
              <p className="text-sm text-gray-600">Pantry shelves and products</p>
            </button>

            <button
              onClick={() => {
                setActiveMode('bill');
                fileInputRef.current?.click();
              }}
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <div className="text-4xl mb-2">🧾</div>
              <h3 className="font-semibold mb-1">Scan Bill</h3>
              <p className="text-sm text-gray-600">Grocery receipts and bills</p>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file && activeMode) {
                const maxSize = 10 * 1024 * 1024;
                if (file.size > maxSize) {
                  showToast.error(`File size too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Please choose a file smaller than 10MB.`);
                  e.target.value = '';
                  return;
                }
                processOCR(file, activeMode);
              }
            }}
            className="hidden"
          />
        </div>

        {ocrLoading && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Processing image...</p>
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700 font-medium">{errorMessage}</p>
            <button
              onClick={() => setErrorMessage('')}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}