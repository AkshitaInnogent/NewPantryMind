import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../services/api";

export const fetchLocations = createAsyncThunk(
  "locations/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get("/locations");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch locations");
    }
  }
);