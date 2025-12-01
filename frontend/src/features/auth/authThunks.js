import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosClient from "../../services/api";

export const registerUser = createAsyncThunk(
  "user/register",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post("/user/register", data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Registration failed");
    }
  }
);

export const loginUser = createAsyncThunk(
  "user/login",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post("/user/login", data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Login failed");
    }
  }
);

export const refreshUser = createAsyncThunk(
  "user/refresh",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get("/user/refresh");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Refresh failed");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "user/logout",
  async (_, { rejectWithValue }) => {
    try {
      await axiosClient.post("/user/logout");
      return true;
    } catch (err) {
      return rejectWithValue("Logout failed");
    }
  }
);