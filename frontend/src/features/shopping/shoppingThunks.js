// frontend/src/features/shopping/shoppingThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
export const fetchShoppingLists = createAsyncThunk(
  "shopping/fetchLists",
  async (kitchenId) => {
    const response = await api.get(`/shopping-lists?kitchenId=${kitchenId}`);
    return response.data;
  }
);
export const createShoppingList = createAsyncThunk(
  "shopping/createList",
  async (listData) => {
    const response = await api.post("/shopping-lists", listData);
    return response.data;
  }
);
export const fetchShoppingListById = createAsyncThunk(
  "shopping/fetchListById",
  async (listId) => {
    const response = await api.get(`/shopping-lists/${listId}`);
    return response.data;
  }
);
export const addItemToList = createAsyncThunk(
  "shopping/addItem",
  async (itemData) => {
    const { shoppingListId, ...data } = itemData;
    const response = await api.post(`/shopping-lists/${shoppingListId}/items?userId=${data.userId || 1}`, {
      itemName: data.canonicalName,
      quantity: data.suggestedQuantity,
      unitId: data.unitId
    });
    return response.data;
  }
);
export const updateItem = createAsyncThunk(
  "shopping/updateItem",
  async ({ itemId, ...updateData }) => {
    const response = await api.put(`/shopping-lists/items/${itemId}`, updateData);
    return response.data;
  }
);
export const deleteItem = createAsyncThunk(
  "shopping/deleteItem",
  async (itemId) => {
    await api.delete(`/shopping-lists/items/${itemId}`);
    return itemId;
  }
);
export const updateItemStatus = createAsyncThunk(
  "shopping/updateItemStatus",
  async ({ itemId, status }) => {
    const response = await api.put(`/shopping-lists/items/${itemId}/status?status=${status}`);
    return { itemId, status, item: response.data };
  }
);
export const generateAISuggestions = createAsyncThunk(
  "shopping/generateAISuggestions",
  async ({ listId, kitchenId }) => {
    const response = await api.post(`/shopping-lists/${listId}/ai-suggestions?kitchenId=${kitchenId}`);
    return response.data;
  }
);
export const addAllLowStockItems = createAsyncThunk(
  "shopping/addAllLowStock",
  async ({ listId, kitchenId }) => {
    const response = await api.post(`/shopping-lists/bulk-add-low-stock?listId=${listId}&kitchenId=${kitchenId}`);
    return response.data;
  }
);
export const addSelectedItems = createAsyncThunk(
  "shopping/addSelectedItems",
  async ({ listId, itemNames }) => {
    const response = await api.post(`/shopping-lists/bulk-add-selected?listId=${listId}`, itemNames);
    return response.data;
  }
);
export const getLowStockItems = createAsyncThunk(
  "shopping/getLowStockItems",
  async (kitchenId) => {
    const response = await api.get(`/shopping-lists/low-stock-items?kitchenId=${kitchenId}`);
    return response.data;
  }
);
export const markAsPurchased = createAsyncThunk(
  "shopping/markAsPurchased",
  async ({ itemId, actualQuantity }) => {
    const response = await api.post(`/shopping-lists/items/${itemId}/purchase?actualQuantity=${actualQuantity || ''}`);
    return response.data;
  }
);