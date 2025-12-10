import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchKitchenMembers = createAsyncThunk(
  "members/fetchKitchenMembers",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { user } = getState().auth;
      const kitchenId = user?.kitchenId;
      if (!kitchenId) {
        return [];
      }
      const url = `/kitchens/members?kitchenId=${kitchenId}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch members");
    }
  }
);

export const removeMember = createAsyncThunk(
  "members/removeMember",
  async (memberId, { rejectWithValue }) => {
    try {
      await api.delete(`/kitchens/members/${memberId}`);
      return memberId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to remove member");
    }
  }
);

export const leaveKitchen = createAsyncThunk(
  "members/leaveKitchen",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { user } = getState().auth;
      await api.post(`/kitchens/leave?userId=${user.id}`);
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to leave kitchen");
    }
  }
);