import { setLoading, setItems, addItem, updateItem, removeItem, setError } from "./inventorySlice";
import axiosClient from "../../services/api";

export const fetchInventoryItems = () => async (dispatch, getState) => {
  dispatch(setLoading(true));
  try {
    const { user } = getState().auth;
    const kitchenId = user?.kitchenId;
    
    if (!kitchenId) {
      console.log("No kitchenId found, returning empty array");
      dispatch(setItems([]));
      return;
    }
    
    console.log("GET request to fetch inventory items for kitchen:", kitchenId);
    const response = await axiosClient.get(`/inventory?kitchenId=${kitchenId}`);
    console.log("GET response status:", response.status);
    console.log("GET response data:", response.data);
    dispatch(setItems(response.data));
  } catch (error) {
    console.log("GET request error:", error);
    dispatch(setError(error.response?.data?.message || "Failed to fetch inventory items"));
  } finally {
    dispatch(setLoading(false));
  }
};

export const createInventoryItem = (itemData) => async (dispatch) => {
  try {
    console.log("POST request to create inventory item with data:", itemData);
    const response = await axiosClient.post("/inventory", itemData);
    console.log("POST response status:", response.status);
    console.log("POST response data:", response.data);
    dispatch(addItem(response.data));
    return response.data;
  } catch (error) {
    console.log("POST request error:", error);
    dispatch(setError(error.response?.data?.message || "Failed to create item"));
    throw error;
  }
};

export const deleteInventoryItem = (itemId) => async (dispatch) => {
  try {
    await axiosClient.delete(`/inventory/${itemId}`);
    dispatch(removeItem(itemId));
  } catch (error) {
    dispatch(setError(error.response?.data?.message || "Failed to delete item"));
  }
};

export const updateInventoryItem = (itemId, itemData) => async (dispatch) => {
  try {
    console.log("PUT request to update inventory item with data:", itemData);
    const response = await axiosClient.put(`/inventory/${itemId}`, itemData);
    console.log("PUT response data:", response.data);
    dispatch(updateItem(response.data));
    return response.data;
  } catch (error) {
    console.log("PUT request error:", error);
    dispatch(setError(error.response?.data?.message || "Failed to update item"));
    throw error;
  }
};

export const fetchInventoryItemById = (itemId) => async (dispatch) => {
  try {
    const response = await axiosClient.get(`/inventory/${itemId}`);
    return response.data;
  } catch (error) {
    dispatch(setError(error.response?.data?.message || "Failed to fetch item"));
    throw error;
  }
};