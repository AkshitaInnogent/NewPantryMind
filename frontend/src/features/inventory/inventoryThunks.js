import { setLoading, setItems, addItem, updateItem, removeItem, setError } from "./inventorySlice";
import axiosClient from "../../services/api";

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
    console.error("Failed to fetch inventory items:", error);
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
    console.error("Failed to create item:", error);
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
    console.error("Failed to update item:", error);
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