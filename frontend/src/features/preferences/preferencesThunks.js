import { setLoading, setPreferences, setError } from "./preferencesSlice";
import axiosClient from "../../services/api";

export const getUserPreferences = (userId) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));
  
  try {
    const response = await axiosClient.get(`/user/preferences/${userId}`);
    dispatch(setPreferences(response.data));
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to load preferences";
    dispatch(setError(errorMessage));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export const saveUserPreferences = (userId, preferences) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));
  
  try {
    const response = await axiosClient.post(`/user/preferences/${userId}`, preferences);
    dispatch(setPreferences(response.data));
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to save preferences";
    dispatch(setError(errorMessage));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export const updateUserPreferences = (userId, preferences) => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));
  
  try {
    const response = await axiosClient.put(`/user/preferences/${userId}`, preferences);
    dispatch(setPreferences(response.data));
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to update preferences";
    dispatch(setError(errorMessage));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};