import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../services/api";

export const fetchUnits = createAsyncThunk(
  "units/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get("/units");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch units");
    }
  }
);

export const createUnit = createAsyncThunk(
  "units/create",
  async (unitData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/units", unitData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create unit");
    }
  }
);