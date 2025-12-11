import { setLoading, setItems, addItem, updateItem, removeItem, setError, consumeItems } from "./inventorySlice";
import axiosClient from "../../services/api";
import BigNumber from 'bignumber.js';

export const fetchInventoryItems = () => async (dispatch, getState) => {
  dispatch(setLoading(true));
  try {
    const { user } = getState().auth;
    const kitchenId = user?.kitchenId;
    
    if (!kitchenId) {
      dispatch(setItems([]));
      return;
    }
    
    const response = await axiosClient.get(`/inventory?kitchenId=${kitchenId}`);
    dispatch(setItems(response.data));
  } catch (error) {
    // Failed to fetch inventory items
    dispatch(setError(error.response?.data?.message || "Failed to fetch inventory items"));
  } finally {
    dispatch(setLoading(false));
  }
};

export const createInventoryItem = (itemData) => async (dispatch) => {
  try {
    const response = await axiosClient.post("/inventory", itemData);
    dispatch(addItem(response.data));
    return response.data;
  } catch (error) {
    // Failed to create item
    dispatch(setError(error.response?.data?.message || "Failed to create item"));
    throw error;
  }
};

export const deleteInventoryItem = (itemId) => async (dispatch) => {
  try {
    await axiosClient.delete(`/inventory/items/${itemId}`);
    dispatch(removeItem(itemId));
  } catch (error) {
    dispatch(setError(error.response?.data?.message || "Failed to delete item"));
  }
};

export const fetchInventoryDetails = (inventoryId) => async (dispatch) => {
  try {
    const response = await axiosClient.get(`/inventory/${inventoryId}`);
    return response.data;
  } catch (error) {
    dispatch(setError(error.response?.data?.message || "Failed to fetch inventory details"));
    throw error;
  }
};

export const updateInventoryItem = (itemId, itemData) => async (dispatch) => {
  try {
    const response = await axiosClient.put(`/inventory/items/${itemId}`, itemData);
    dispatch(updateItem(response.data));
    return response.data;
  } catch (error) {
    // Failed to update item
    dispatch(setError(error.response?.data?.message || "Failed to update item"));
    throw error;
  }
};

export const fetchInventoryItemById = (itemId) => async (dispatch) => {
  try {
    const response = await axiosClient.get(`/inventory/items/${itemId}`);
    return response.data;
  } catch (error) {
    dispatch(setError(error.response?.data?.message || "Failed to fetch item"));
    throw error;
  }
};

export const fetchInventory = () => async (dispatch, getState) => {
  dispatch(setLoading(true));
  try {
    const { user } = getState().auth;
    const kitchenId = user?.kitchenId;
    
    if (!kitchenId) {
      dispatch(setItems([]));
      return;
    }
    
    const response = await axiosClient.get(`/inventory?kitchenId=${kitchenId}`);
    dispatch(setItems(response.data));
  } catch (error) {
    dispatch(setError(error.response?.data?.message || "Failed to fetch inventory"));
  } finally {
    dispatch(setLoading(false));
  }
};

export const updateInventoryAlerts = (inventoryId, alertData) => async (dispatch) => {
  try {
    const response = await axiosClient.put(`/inventory/${inventoryId}/alerts`, alertData);
    dispatch(updateItem(response.data));
    return response.data;
  } catch (error) {
    // Update alerts error
    dispatch(setError(error.response?.data?.message || "Failed to update alerts"));
    throw error;
  }
};

export const cookRecipe = (recipe) => async (dispatch, getState) => {
  try {
    // First ensure inventory is loaded
    let { items } = getState().inventory;
    
    if (!items || items.length === 0) {
      console.log('No inventory items in state, fetching...');
      await dispatch(fetchInventoryItems());
      items = getState().inventory.items;
    }
    
    console.log('Recipe ingredients:', recipe.ingredients);
    
    // Handle different inventory data structures
    let flatItems = [];
    
    if (Array.isArray(items)) {
      items.forEach(item => {
        if (item && typeof item === 'object') {
          // Check if it's a grouped inventory item
          if (item.items && Array.isArray(item.items)) {
            item.items.forEach(subItem => {
              if (subItem && subItem.name && subItem.id) {
                flatItems.push(subItem);
              }
            });
          }
          // Check if it's a direct inventory item
          else if (item.name && item.id) {
            flatItems.push(item);
          }
          // Check if it has a different structure (like totalQuantity, name, etc.)
          else if (item.name && (item.totalQuantity || item.quantity)) {
            flatItems.push({
              id: item.id,
              name: item.name,
              quantity: item.totalQuantity || item.quantity,
              unitName: item.unitName
            });
          }
        }
      });
    }
    
    if (flatItems.length === 0) {
      // Try a simpler approach - just use the items as they are
      flatItems = items.filter(item => item && item.name && item.id);
    }
    
    console.log('Processed flat items:', flatItems.map(item => ({ 
      id: item.id, 
      name: item.name, 
      quantity: item.quantity || item.totalQuantity,
      unitName: item.unitName
    })));
    
    if (flatItems.length === 0) {
      throw new Error('No valid inventory items found. Please add items to your inventory first.');
    }
    
    // Unit normalization function
    const normalizeUnit = (unit) => {
      if (!unit) return '';
      const unitLower = unit.toLowerCase().trim();
      
      // Weight units
      if (['g', 'gm', 'gram', 'grams'].includes(unitLower)) return 'grams';
      if (['kg', 'kilogram', 'kilograms'].includes(unitLower)) return 'kg';
      
      // Volume units
      if (['ml', 'milliliter', 'milliliters'].includes(unitLower)) return 'ml';
      if (['l', 'liter', 'liters', 'litre', 'litres'].includes(unitLower)) return 'liters';
      
      // Count units
      if (['pc', 'pcs', 'piece', 'pieces'].includes(unitLower)) return 'pieces';
      if (['dozen', 'doz'].includes(unitLower)) return 'dozen';
      
      return unitLower;
    };
    
    // Convert quantity to base unit
    const convertToBaseUnit = (quantity, unit) => {
      const unitLower = unit.toLowerCase().trim();
      
      // Convert kg to grams
      if (['kg', 'kilogram', 'kilograms'].includes(unitLower)) {
        return quantity * 1000;
      }
      
      // Convert liters to ml
      if (['l', 'liter', 'liters', 'litre', 'litres'].includes(unitLower)) {
        return quantity * 1000;
      }
      
      // Convert dozen to pieces
      if (['dozen', 'doz'].includes(unitLower)) {
        return quantity * 12;
      }
      
      return quantity;
    };
    
    const itemsToConsume = [];
    
    recipe.ingredients.forEach(ingredient => {
      if (!ingredient || typeof ingredient !== 'string') return;
      
      const [name, quantityUnit] = ingredient.split(':');
      if (!name) return;
      
      const cleanName = name.trim().toLowerCase();
      
      // Extract quantity and unit from quantityUnit string
      const quantityUnitStr = quantityUnit.trim();
      const quantityMatch = quantityUnitStr.match(/(\d+(?:\.\d+)?)\s*([a-zA-Z]+)/);
      
      if (!quantityMatch) {
        console.log(`Could not parse quantity/unit from: "${quantityUnitStr}"`);
        return;
      }
      
      const recipeQuantity = parseFloat(quantityMatch[1]);
      const recipeUnit = quantityMatch[2];
      const normalizedRecipeUnit = normalizeUnit(recipeUnit);
      const baseRecipeQuantity = convertToBaseUnit(recipeQuantity, recipeUnit);
      
      console.log(`Recipe needs: ${recipeQuantity} ${recipeUnit} (${baseRecipeQuantity} ${normalizedRecipeUnit}) of "${cleanName}"`);
      
      // Find matching item with unit compatibility
      const matchedItem = flatItems.find(item => {
        if (!item.name) return false;
        const itemName = item.name.toLowerCase();
        
        // Check name match
        let nameMatches = false;
        
        // Try exact match first
        if (itemName === cleanName) nameMatches = true;
        
        // Try contains match
        if (!nameMatches && (itemName.includes(cleanName) || cleanName.includes(itemName))) nameMatches = true;
        
        // Try word-by-word match
        if (!nameMatches) {
          const nameWords = cleanName.split(/\s+/);
          const itemWords = itemName.split(/\s+/);
          
          nameMatches = nameWords.some(word => 
            itemWords.some(itemWord => 
              word.length > 2 && itemWord.length > 2 && 
              (word.includes(itemWord) || itemWord.includes(word))
            )
          );
        }
        
        if (!nameMatches) return false;
        
        // Check unit compatibility
        if (item.unitName) {
          const normalizedItemUnit = normalizeUnit(item.unitName);
          const unitCompatible = normalizedItemUnit === normalizedRecipeUnit;
          
          console.log(`Item "${item.name}" unit: ${item.unitName} (${normalizedItemUnit}) vs recipe unit: ${recipeUnit} (${normalizedRecipeUnit}) - Compatible: ${unitCompatible}`);
          
          return unitCompatible;
        }
        
        return true; // If no unit info, assume compatible
      });
      
      console.log(`Ingredient "${cleanName}" matched with:`, matchedItem?.name || 'No match');
      
      if (matchedItem) {
        itemsToConsume.push({ 
          id: matchedItem.id, 
          consumedQuantity: baseRecipeQuantity 
        });
      }
    });

    console.log('Items to consume:', itemsToConsume);

    if (itemsToConsume.length === 0) {
      throw new Error(`No matching inventory items found. Please check that you have the required ingredients with compatible units.`);
    }
    
    // Check if we have all required ingredients
    if (itemsToConsume.length < recipe.ingredients.length) {
      const missingIngredients = recipe.ingredients.filter(ingredient => {
        const [name] = ingredient.split(':');
        const cleanName = name.trim().toLowerCase();
        return !itemsToConsume.some(item => {
          const matchedItem = flatItems.find(fi => fi.id === item.id);
          return matchedItem?.name.toLowerCase().includes(cleanName);
        });
      });
      
      throw new Error(`Missing ingredients: ${missingIngredients.join(', ')}. Please add these to your inventory first.`);
    }

    // Call backend API to update database with userId
    const { user } = getState().auth;
    console.log('Sending consume request:', { items: itemsToConsume, userId: user?.id });
    
    const response = await axiosClient.post('/inventory/consume', { 
      items: itemsToConsume,
      userId: user?.id
    });
    
    // Create meal log entry
    try {
      // Extract cooking time from recipe
      const cookingTimeMatch = recipe.cooking_time?.match(/(\d+)/);
      const cookingMinutes = cookingTimeMatch ? parseInt(cookingTimeMatch[1]) : null;
      
      // Create ingredient usage list in the format expected by the backend
      const ingredientUsage = itemsToConsume.map(item => {
        const matchedItem = flatItems.find(fi => fi.id === item.id);
        return {
          itemId: item.id,
          name: matchedItem?.name || 'Unknown',
          quantity: item.consumedQuantity ? new BigNumber(item.consumedQuantity).toNumber() : 0
        };
      });
      
      // Ensure we have all required fields
      if (!user?.kitchenId || !user?.id) {
        throw new Error('User information is missing. Please log in again.');
      }
      
      // Determine meal type based on time of day
      const hours = new Date().getHours();
      let mealType = 'DINNER'; // Default to dinner
      if (hours >= 3 && hours < 11) mealType = 'BREAKFAST';
      else if (hours >= 11 && hours < 16) mealType = 'LUNCH';
      
      const mealLogData = {
        kitchenId: user.kitchenId,
        cookedBy: user.id,
        mealName: recipe.name || 'Unnamed Recipe',
        mealType: mealType,
        servings: recipe.servings || 1,
        ingredients: ingredientUsage,
        recipeData: JSON.stringify({
          originalIngredients: recipe.ingredients,
          actualIngredients: ingredientUsage,
          cookingTime: recipe.cooking_time
        })
      };
      
      console.log('Sending meal log data:', mealLogData);
      
      const response = await axiosClient.post('/tracking/log-meal', mealLogData);
      console.log('Meal log created successfully:', response.data);
    } catch (mealLogError) {
      console.warn('Failed to create meal log:', mealLogError);
    }
    
    // Update Redux state
    await dispatch(fetchInventoryItems());
    
    // Return consumption details for display
    return response.data;
    
    console.log(`Successfully consumed ${itemsToConsume.length} items`);
  } catch (error) {
    console.error('Failed to consume recipe ingredients:', error);
    dispatch(setError(error.message || 'Failed to consume recipe ingredients'));
    throw error;
  }
};


export const getConsumptionInfo = (inventoryId) => async (dispatch) => {
  try {
    const response = await axiosClient.get(`/inventory/${inventoryId}/consumption-info`);
    return response.data;
  } catch (error) {
    dispatch(setError(error.response?.data?.message || "Failed to fetch consumption info"));
    throw error;
  }
};

export const manualConsumeItem = (itemId, quantity) => async (dispatch, getState) => {
  try {
    const { user } = getState().auth;
    const itemsToConsume = [{ id: itemId, consumedQuantity: quantity }];
    
    // Call backend API with userId for tracking
    const response = await axiosClient.post('/inventory/consume', { 
      items: itemsToConsume,
      userId: user?.id
    });
    
    // Refresh inventory data from server
    await dispatch(fetchInventoryItems());
    
    // Dispatch custom event for any components listening
    window.dispatchEvent(new CustomEvent('inventoryUpdated'));
    
    console.log(`Successfully consumed ${quantity} from item ${itemId}`);
    return response;
  } catch (error) {
    console.error('Failed to consume item manually:', error);
    dispatch(setError(error.response?.data?.message || 'Failed to consume item'));
    throw error;
  }
};
