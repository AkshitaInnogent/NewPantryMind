import React, { useState } from 'react';
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
          <h3>AI Suggestions</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {loading ? (
            <div className="loading">Getting suggestions...</div>
          ) : suggestions.length === 0 ? (
            <div className="no-suggestions">No suggestions available</div>
          ) : (
            <>
              <div className="suggestions-header">
                <button 
                  className="select-all-btn"
                  onClick={handleSelectAll}
                >
                  {selectedItems.size === suggestions.length ? 'Deselect All' : 'Select All'}
                </button>
                <span className="suggestion-count">
                  {suggestions.length} suggestions found
                </span>
              </div>
              
              <div className="suggestions-list">
                {suggestions.map((suggestion, index) => (
                  <div 
                    key={index} 
                    className={`suggestion-item ${selectedItems.has(index) ? 'selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.has(index)}
                      onChange={() => handleItemToggle(index)}
                    />
                    <div className="item-details">
                      <div className="item-name">{suggestion.itemName}</div>
                      <div className="item-info">
                        {suggestion.suggestedQuantity} {suggestion.unitName}
                      </div>
                      <div className="item-reason">{suggestion.reason}</div>
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
            Add Selected ({selectedItems.size})
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuggestionsModal;
