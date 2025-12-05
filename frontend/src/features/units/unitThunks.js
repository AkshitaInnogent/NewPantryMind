import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../services/api";

const createEntityThunk = (name, method, endpoint, errorMsg) => 
  createAsyncThunk(name, async (data, { rejectWithValue }) => {
    try {
      const response = await axiosClient[method](endpoint, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || errorMsg);
    }
  });

export const fetchUnits = createEntityThunk(
  "units/fetchAll", "get", "/units", "Failed to fetch units"
);

export const createUnit = createEntityThunk(
  "units/create", "post", "/units", "Failed to create unit"
);