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

export const updateProfile = createAsyncThunk(
  "user/updateProfile",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axiosClient.put("/user/profile", data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Profile update failed");
    }
  }
);

export const changePassword = createAsyncThunk(
  "user/changePassword",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post("/user/change-password", data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Password change failed");
    }
  }
);

export const validateUser = createAsyncThunk(
  "user/validate",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get("/user/profile");
      return res.data;
    } catch (err) {
      return rejectWithValue("User validation failed");
    }
  }
);

// OTP Thunks
export const sendRegistrationOtp = createAsyncThunk(
  "user/sendRegistrationOtp",
  async (email, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post("/user/send-registration-otp", { email });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to send OTP");
    }
  }
);

export const verifyRegistrationOtp = createAsyncThunk(
  "user/verifyRegistrationOtp",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post("/user/verify-registration-otp", { email, otp });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "OTP verification failed");
    }
  }
);

export const sendPasswordResetOtp = createAsyncThunk(
  "user/sendPasswordResetOtp",
  async (email, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post("/user/send-password-reset-otp", { email });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to send reset OTP");
    }
  }
);

export const resetPasswordWithOtp = createAsyncThunk(
  "user/resetPasswordWithOtp",
  async ({ email, otp, newPassword }, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post("/user/reset-password-with-otp", { email, otp, newPassword });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Password reset failed");
    }
  }
);