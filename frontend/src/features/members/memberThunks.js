import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchKitchenMembers = createAsyncThunk(
  "members/fetchKitchenMembers",
  async (_, { rejectWithValue, getState }) => {
    try {
      const { user } = getState().auth;
      const kitchenId = user?.kitchenId;
      console.log("🔍 Fetching members for kitchenId:", kitchenId);
      if (!kitchenId) {
        console.log("❌ No kitchenId found, returning empty array");
        return [];
      }
      const url = `/kitchens/members?kitchenId=${kitchenId}`;
      console.log("📡 Calling API:", url);
      const response = await api.get(url);
      console.log("✅ API Response:", response.data);
      return response.data;
    } catch (error) {
      console.log("❌ API Error:", error);
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