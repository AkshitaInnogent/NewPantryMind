import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Button, Input, LoadingSpinner, Alert } from '../../components/ui';
import { fetchShoppingLists, addItemToList, updateItem, deleteItem } from '../../features/shopping/shoppingThunks';
import { fetchUnits } from '../../features/units/unitThunks';
import PageLayout from '../../components/layout/PageLayout';
import SuggestionsModal from '../../components/shopping/SuggestionsModel';
import { config } from '../../config/env';
import './ShoppingList.css';

const ShoppingList = () => {
    const dispatch = useDispatch();
    const { lists, loading, error } = useSelector(state => state.shopping);
    const { units } = useSelector(state => state.units);
    const { user } = useSelector(state => state.auth);
    const [activeTab, setActiveTab] = useState('DAILY');
    const [newItem, setNewItem] = useState({ name: '', quantity: 1, unitId: 1 });
    const [editingItem, setEditingItem] = useState(null);
    const [editQuantity, setEditQuantity] = useState('');
    
    // AI Suggestions Modal State
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);

    useEffect(() => {
        if (user?.kitchenId) {
            dispatch(fetchShoppingLists(user.kitchenId));
        }
        dispatch(fetchUnits());
    }, [dispatch, user]);

    const activeList = lists.find(list => list.listType === activeTab);

    const handleAddItem = async () => {
        if (!newItem.name.trim() || !activeList) return;
        
        await dispatch(addItemToList({
            shoppingListId: activeList.id,
            canonicalName: newItem.name,
            suggestedQuantity: newItem.quantity,
            unitId: newItem.unitId
        }));
        
        setNewItem({ name: '', quantity: 1, unitId: 1 });
    };

    const handleUpdateItem = async (itemId) => {
        if (!editQuantity) return;
        
        await dispatch(updateItem({ 
            itemId, 
            suggestedQuantity: parseFloat(editQuantity)
        }));
        
        setEditingItem(null);
        setEditQuantity('');
    };

    const handleDeleteItem = async (itemId) => {
        if (window.confirm('Remove this item from the list?')) {
            await dispatch(deleteItem(itemId));
        }
    };

    const handleGenerateAI = async () => {
        if (!activeList || !user?.kitchenId) return;
        
        setSuggestionsLoading(true);
        setShowSuggestions(true);
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${config.apiBaseUrl}/shopping-lists/${activeList.id}/ai-suggestions?kitchenId=${user.kitchenId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const suggestionsData = await response.json();
                setSuggestions(suggestionsData);
            } else {
                console.error('Failed to get suggestions');
                setSuggestions([]);
            }
        } catch (error) {
            console.error('Error getting suggestions:', error);
            setSuggestions([]);
        } finally {
            setSuggestionsLoading(false);
        }
    };

    const handleAddSelected = async (selectedSuggestions) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${config.apiBaseUrl}/shopping-lists/${activeList.id}/add-suggestions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(selectedSuggestions)
            });
            
            if (response.ok) {
                dispatch(fetchShoppingLists(user.kitchenId));
                setShowSuggestions(false);
                setSuggestions([]);
            } else {
                console.error('Failed to add suggestions');
            }
        } catch (error) {
            console.error('Error adding suggestions:', error);
        }
    };

    const getListIcon = (type) => {
        const icons = {
            DAILY: '📅',
            WEEKLY: '📊',
            MONTHLY: '🗓️',
            RANDOM: '🎲'
        };
        return icons[type] || '📝';
    };

    const getListDescription = (type) => {
        const descriptions = {
            DAILY: 'Fresh items and immediate needs',
            WEEKLY: 'Regular groceries and planned meals',
            MONTHLY: 'Bulk items and non-perishables',
            RANDOM: 'Mixed suggestions based on patterns'
        };
        return descriptions[type] || '';
    };

    if (loading) return <PageLayout><LoadingSpinner /></PageLayout>;
    if (error) return <PageLayout><Alert type="error" message={error} /></PageLayout>;

    return (
        <PageLayout
            title="Smart Shopping Lists"
            subtitle="AI-powered suggestions based on your usage patterns"
            icon="🛒"
        >
            <div className="shopping-list-container">
                <div className="list-tabs">
                    {['DAILY', 'WEEKLY', 'MONTHLY', 'RANDOM'].map(type => (
                        <button
                            key={type}
                            className={`tab-button ${activeTab === type ? 'active' : ''}`}
                            onClick={() => setActiveTab(type)}
                        >
                            <span className="tab-icon">{getListIcon(type)}</span>
                            <span className="tab-text">{type}</span>
                        </button>
                    ))}
                </div>

                {lists.length === 0 ? (
                    <Card className="shopping-list-card">
                        <div className="empty-list">
                            <div className="empty-icon">🛒</div>
                            <h3>No shopping lists found</h3>
                            <p>Lists will be created automatically when you join a kitchen</p>
                        </div>
                    </Card>
                ) : !activeList ? (
                    <Card className="shopping-list-card">
                        <div className="empty-list">
                            <div className="empty-icon">🛒</div>
                            <h3>{activeTab} list not found</h3>
                            <p>This list type is not available yet</p>
                        </div>
                    </Card>
                ) : (
                    <Card className="shopping-list-card">
                        <div className="list-header">
                            <div className="list-title">
                                <h2>{getListIcon(activeTab)} {activeTab} Shopping List</h2>
                                <p className="list-description">{getListDescription(activeTab)}</p>
                            </div>
                            <div className="list-actions">
                                <Button 
                                    onClick={handleGenerateAI}
                                    className="ai-button"
                                    disabled={loading}
                                >
                                    🤖 AI Suggestions
                                </Button>
                            </div>
                        </div>

                        <div className="add-item-section">
                            <div className="add-item-form">
                                <Input
                                    placeholder="Add item..."
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                                    className="item-input"
                                />
                                <Input
                                    type="number"
                                    placeholder="Qty"
                                    value={newItem.quantity}
                                    onChange={(e) => setNewItem({...newItem, quantity: Number(e.target.value)})}
                                    className="quantity-input"
                                    min="1"
                                />
                                <select
                                    value={newItem.unitId}
                                    onChange={(e) => setNewItem({...newItem, unitId: Number(e.target.value)})}
                                    className="unit-select"
                                >
                                    {units?.map(unit => (
                                        <option key={unit.id} value={unit.id}>
                                            {unit.name}
                                        </option>
                                    ))}
                                </select>
                                <Button onClick={handleAddItem} className="add-button">
                                    ➕ Add
                                </Button>
                            </div>
                        </div>

                        <div className="shopping-items">
                            {!activeList.items || activeList.items.length === 0 ? (
                                <div className="empty-list">
                                    <div className="empty-icon">🛒</div>
                                    <h3>No items in this list</h3>
                                    <p>Add items manually or generate AI suggestions</p>
                                    <Button onClick={handleGenerateAI} className="ai-button">
                                        🤖 Generate AI Suggestions
                                    </Button>
                                </div>
                            ) : (
                                activeList.items.map(item => (
                                    <div key={item.id} className="shopping-item">
                                        <div className="item-info">
                                            <div className="item-name">
                                                {item.canonicalName}
                                                {item.suggestedBy === 'AI' && <span className="ai-badge">🤖 AI</span>}
                                            </div>
                                            <div className="item-details">
                                                {editingItem === item.id ? (
                                                    <div className="edit-quantity">
                                                        <Input
                                                            type="number"
                                                            value={editQuantity}
                                                            onChange={(e) => setEditQuantity(e.target.value)}
                                                            className="quantity-edit"
                                                            min="0.1"
                                                            step="0.1"
                                                        />
                                                        <Button 
                                                            onClick={() => handleUpdateItem(item.id)}
                                                            className="save-button"
                                                        >
                                                            ✓
                                                        </Button>
                                                        <Button 
                                                            onClick={() => {
                                                                setEditingItem(null);
                                                                setEditQuantity('');
                                                            }}
                                                            className="cancel-button"
                                                        >
                                                            ✕
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <span 
                                                        className="item-quantity"
                                                        onClick={() => {
                                                            setEditingItem(item.id);
                                                            setEditQuantity(item.suggestedQuantity);
                                                        }}
                                                    >
                                                        {item.suggestedQuantity} {item.unit?.name || 'units'}
                                                    </span>
                                                )}
                                                {item.suggestionReason && (
                                                    <div className="suggestion-reason">
                                                        {item.suggestionReason}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="item-actions">
                                            <Button 
                                                onClick={() => handleDeleteItem(item.id)}
                                                className="delete-button"
                                            >
                                                🗑️
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                )}

                <SuggestionsModal
                    isOpen={showSuggestions}
                    onClose={() => {
                        setShowSuggestions(false);
                        setSuggestions([]);
                    }}
                    suggestions={suggestions}
                    onAddSelected={handleAddSelected}
                    loading={suggestionsLoading}
                />
            </div>
        </PageLayout>
    );
};

export default ShoppingList;
