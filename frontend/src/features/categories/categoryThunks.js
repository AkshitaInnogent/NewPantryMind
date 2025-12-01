import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../services/api";

export const fetchCategories = createAsyncThunk(
  "categories/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosClient.get("/categories");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch categories");
    }
  }
);

export const createCategory = createAsyncThunk(
  "categories/create",
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post("/categories", categoryData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create category");
    }
  }
);