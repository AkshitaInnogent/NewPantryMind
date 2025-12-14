import React, { useState } from 'react';
import { Bot, X, CheckSquare, Square, BarChart3, ShoppingCart, Package, Lightbulb, Plus } from 'lucide-react';
import './SuggestionsModal.css';

const SuggestionsModal = ({ isOpen, onClose, suggestions, onAddSelected, loading }) => {
  const [selectedItems, setSelectedItems] = useState(new Set());

  const handleItemToggle = (index) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === suggestions.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(suggestions.map((_, index) => index)));
    }
  };

  const handleAddSelected = () => {
    const selected = suggestions.filter((_, index) => selectedItems.has(index));
    onAddSelected(selected);
    setSelectedItems(new Set());
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="suggestions-modal">
        <div className="modal-header">
          <h3 className="flex items-center gap-2"><Bot className="w-5 h-5" /> AI Suggestions</h3>
          <button className="close-btn" onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        
        <div className="modal-body">
          {loading ? (
            <div className="loading flex items-center justify-center gap-2"><Bot className="w-5 h-5 animate-pulse" /> Getting AI suggestions...</div>
          ) : suggestions.length === 0 ? (
            <div className="no-suggestions flex items-center justify-center gap-2"><X className="w-5 h-5" /> No suggestions available</div>
          ) : (
            <>
              <div className="suggestions-header">
                <button 
                  className="select-all-btn"
                  onClick={handleSelectAll}
                >
                  <span className="flex items-center gap-2">
                    {selectedItems.size === suggestions.length ? 
                      <><CheckSquare className="w-4 h-4" /> Deselect All</> : 
                      <><Square className="w-4 h-4" /> Select All</>
                    }
                  </span>
                </button>
                <span className="suggestion-count">
                  <span className="flex items-center gap-2"><BarChart3 className="w-4 h-4" /> {suggestions.length} suggestions found</span>
                </span>
              </div>
              
              <div className="suggestions-list">
                {suggestions.map((suggestion, index) => (
                  <div 
                    key={index} 
                    className={`suggestion-item ${selectedItems.has(index) ? 'selected' : ''}`}
                    onClick={() => handleItemToggle(index)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.has(index)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleItemToggle(index);
                      }}
                    />
                    <div className="item-details">
                      <div className="item-name flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> {suggestion.itemName}</div>
                      <div className="item-info">
                        <span className="flex items-center gap-2"><Package className="w-4 h-4" /> <strong>{suggestion.suggestedQuantity} {suggestion.unitName}</strong></span>
                        {suggestion.confidenceScore && (
                          <span style={{marginLeft: '10px', color: '#28a745', fontSize: '12px'}}>
                            <CheckSquare className="w-3 h-3" /> {Math.round(suggestion.confidenceScore * 100)}% confidence
                          </span>
                        )}
                      </div>
                      <div className="item-reason flex items-center gap-2"><Lightbulb className="w-4 h-4" /> {suggestion.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="add-btn" 
            onClick={handleAddSelected}
            disabled={selectedItems.size === 0 || loading}
          >
            <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Add Selected ({selectedItems.size})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuggestionsModal;
