import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../services/api";
import { updateUserRole, updateUserKitchen } from "../auth/authSlice";
import { refreshUser } from "../auth/authThunks";

// Create kitchen and become ADMIN
export const createKitchenWithAdmin = createAsyncThunk(
  "kitchen/createWithAdmin",
  async (data, { rejectWithValue, getState, dispatch }) => {
    try {
      const { user } = getState().auth;
      
      if (!user?.id) {
        // User ID not found in state
        return rejectWithValue("User ID not found. Please login again.");
      }

      // Creating kitchen with userId
      const res = await axiosClient.post(`/kitchens/create-with-admin?userId=${user.id}`, {
        name: data.name
      });
      
      //  ADD: Update user role to ADMIN
      dispatch(updateUserRole("ADMIN"));
      dispatch(updateUserKitchen(res.data.id));
      
      return res.data;
    } catch (err) {
      // Kitchen creation error
      return rejectWithValue(err.response?.data || "Kitchen creation failed");
    }
  }
);

// Join existing kitchen and become MEMBER
export const joinKitchen = createAsyncThunk(
  "kitchen/join",
  async (data, { rejectWithValue, getState, dispatch }) => {
    try {
      const { user } = getState().auth;
      
      if (!user?.id) {
        // User ID not found in state
        return rejectWithValue("User ID not found. Please login again.");
      }

      // Joining kitchen with invitation code
      const res = await axiosClient.post(`/kitchens/join-by-code`, {
        invitationCode: data.invitationCode,
        userId: user.id
      });
      
      //  ADD: Update user role to MEMBER
      dispatch(updateUserRole("MEMBER"));
      dispatch(updateUserKitchen(res.data.id));
      
      return res.data;
    } catch (err) {
      // Kitchen join error
      return rejectWithValue(err.response?.data || "Failed to join kitchen");
    }
  }
);

// Get user's kitchens
export const getUserKitchens = createAsyncThunk(
  "kitchen/getUserKitchens",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get("/kitchens");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch kitchens");
    }
  }
);

// Update kitchen name
export const updateKitchen = createAsyncThunk(
  "kitchen/update",
  async ({ kitchenId, name }, { rejectWithValue }) => {
    try {
      const res = await axiosClient.put(`/kitchens/${kitchenId}`, { name });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Kitchen update failed");
    }
  }
);
