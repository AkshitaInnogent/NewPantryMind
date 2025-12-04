import { createAsyncThunk } from '@reduxjs/toolkit';
import shoppingListService from '../../services/shoppingListService';

export const fetchShoppingList = createAsyncThunk(
  'shoppingList/fetchShoppingList',
  async (kitchenId, { rejectWithValue }) => {
    try {
      return await shoppingListService.getShoppingList(kitchenId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch shopping list');
    }
  }
);

export const generateFromLowStock = createAsyncThunk(
  'shoppingList/generateFromLowStock',
  async ({ kitchenId, threshold = 3 }, { rejectWithValue }) => {
    try {
      return await shoppingListService.generateFromLowStock(kitchenId, threshold);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate from low stock');
    }
  }
);

export const addShoppingItem = createAsyncThunk(
  'shoppingList/addShoppingItem',
  async (itemData, { rejectWithValue }) => {
    try {
      return await shoppingListService.addItem(itemData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add item');
    }
  }
);

export const togglePurchased = createAsyncThunk(
  'shoppingList/togglePurchased',
  async (itemId, { rejectWithValue }) => {
    try {
      return await shoppingListService.togglePurchased(itemId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update item');
    }
  }
);

export const deleteShoppingItem = createAsyncThunk(
  'shoppingList/deleteShoppingItem',
  async (itemId, { rejectWithValue }) => {
    try {
      await shoppingListService.deleteItem(itemId);
      return itemId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete item');
    }
  }
);

export const clearPurchasedItems = createAsyncThunk(
  'shoppingList/clearPurchasedItems',
  async (kitchenId, { rejectWithValue }) => {
    try {
      await shoppingListService.clearPurchasedItems(kitchenId);
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear items');
    }
  }
);
