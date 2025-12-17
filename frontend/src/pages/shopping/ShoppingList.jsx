import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Button, Input, LoadingSpinner } from '../../components/ui';
import { showToast } from '../../utils/toast';
import { showAlert } from '../../utils/sweetAlert';
import { fetchShoppingLists, addItemToList, updateItem, deleteItem } from '../../features/shopping/shoppingThunks';
import { fetchUnits } from '../../features/units/unitThunks';
import PageLayout from '../../components/layout/PageLayout';
import SuggestionsModal from '../../components/shopping/SuggestionsModel';
import { config } from '../../config/env';
import { Calendar, BarChart3, CalendarDays, AlertTriangle, ShoppingCart, Bot, Plus, Check, X, Trash2 } from 'lucide-react';
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
        const result = await showAlert.confirm(
            'Remove Item',
            'Are you sure you want to remove this item from the shopping list?',
            'Yes, remove'
        );
        
        if (result.isConfirmed) {
            await dispatch(deleteItem(itemId));
        }
    };

    const handleGenerateAI = async () => {
        if (!activeList || !user?.kitchenId) return;
        
        setSuggestionsLoading(true);
        setShowSuggestions(true);
        
        try {
            const token = localStorage.getItem('token');
            
            // Call the AI suggestions API endpoint (only returns suggestions, doesn't add to list)
            const response = await fetch(`${config.apiBaseUrl}/shopping-lists/${activeList.id}/ai-suggestions?kitchenId=${user.kitchenId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const suggestionsData = await response.json();
                console.log('AI Predictions received:', suggestionsData);
                
                // Convert backend response to frontend format
                const formattedSuggestions = suggestionsData.map(item => ({
                    itemName: item.itemName || item.canonicalName || item.rawName,
                    suggestedQuantity: item.suggestedQuantity,
                    unitName: item.unitName || item.unit?.name || 'grams',
                    unitId: item.unitId || item.unit?.id,
                    reason: item.reason || item.suggestionReason || `Based on ${activeTab.toLowerCase()} consumption pattern`,
                    confidenceScore: item.confidenceScore || 0.8
                }));
                
                setSuggestions(formattedSuggestions);
                
                if (formattedSuggestions.length === 0) {
                    showToast.info(`No predictions available for ${activeTab.toLowerCase()} period. Try adding more consumption data.`);
                }
            } else {
                console.error('Failed to get predictions');
                setSuggestions([]);
                showToast.error('Failed to generate AI predictions');
            }
        } catch (error) {
            console.error('Error getting predictions:', error);
            setSuggestions([]);
            showToast.error('Error connecting to AI service');
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
            DAILY: <Calendar className="w-5 h-5" />,
            WEEKLY: <BarChart3 className="w-5 h-5" />,
            MONTHLY: <CalendarDays className="w-5 h-5" />,
            RANDOM: <AlertTriangle className="w-5 h-5" />
        };
        return icons[type] || <ShoppingCart className="w-5 h-5" />;
    };

    const getListDescription = (type) => {
        const descriptions = {
            DAILY: 'Fresh items and immediate needs',
            WEEKLY: 'Regular groceries and planned meals',
            MONTHLY: 'Bulk items and non-perishables',
            RANDOM: 'Items running low in your pantry'
        };
        return descriptions[type] || '';
    };

    useEffect(() => {
        if (error) {
            showToast.error("Failed to load shopping lists");
        }
    }, [error]);

    if (loading) return <PageLayout><LoadingSpinner /></PageLayout>;

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
                            <span className="tab-text">{type === 'RANDOM' ? 'LOW STOCK' : type}</span>
                        </button>
                    ))}
                </div>

                {lists.length === 0 ? (
                    <Card className="shopping-list-card">
                        <div className="empty-list">
                            <div className="empty-icon"><ShoppingCart className="w-12 h-12 text-gray-400" /></div>
                            <h3>No shopping lists found</h3>
                            <p>Lists will be created automatically when you join a kitchen</p>
                        </div>
                    </Card>
                ) : !activeList ? (
                    <Card className="shopping-list-card">
                        <div className="empty-list">
                            <div className="empty-icon"><ShoppingCart className="w-12 h-12 text-gray-400" /></div>
                            <h3>{activeTab} list not found</h3>
                            <p>This list type is not available yet</p>
                        </div>
                    </Card>
                ) : (
                    <Card className="shopping-list-card">
                        <div className="list-header">
                            <div className="list-title">
                                <h2 className="flex items-center gap-2">{getListIcon(activeTab)} {activeTab === 'RANDOM' ? 'LOW STOCK' : activeTab} Shopping List</h2>
                                <p className="list-description">{getListDescription(activeTab)}</p>
                            </div>
                            <div className="list-actions">
                                <Button 
                                    onClick={handleGenerateAI}
                                    className="ai-button flex items-center gap-2"
                                    disabled={loading}
                                >
                                    <Bot className="w-4 h-4" /> AI Suggestions
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
                                <Button onClick={handleAddItem} className="add-button flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> Add
                                </Button>
                            </div>
                        </div>

                        <div className="shopping-items">
                            {!activeList.items || activeList.items.length === 0 ? (
                                <div className="empty-list">
                                    <div className="empty-icon"><ShoppingCart className="w-12 h-12 text-gray-400" /></div>
                                    <h3>No items in this list</h3>
                                    <p>Add items manually or generate AI suggestions</p>
                                    <Button onClick={handleGenerateAI} className="ai-button flex items-center gap-2">
                                        <Bot className="w-4 h-4" /> Generate AI Suggestions for {activeTab === 'RANDOM' ? 'LOW STOCK' : activeTab}
                                    </Button>
                                </div>
                            ) : (
                                activeList.items.map(item => (
                                    <div key={item.id} className="shopping-item">
                                        <div className="item-info">
                                            <div className="item-name">
                                                {item.canonicalName}
                                                {item.suggestedBy === 'AI' && <span className="ai-badge flex items-center gap-1"><Bot className="w-3 h-3" /> AI</span>}
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
                                                            <Check className="w-4 h-4" />
                                                        </Button>
                                                        <Button 
                                                            onClick={() => {
                                                                setEditingItem(null);
                                                                setEditQuantity('');
                                                            }}
                                                            className="cancel-button"
                                                        >
                                                            <X className="w-4 h-4" />
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
                                                <Trash2 className="w-4 h-4" />
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
