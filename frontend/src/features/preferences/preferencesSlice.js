import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  preferences: null,
  loading: false,
  error: null,
};

const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setPreferences: (state, action) => {
      state.preferences = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updatePreference: (state, action) => {
      if (state.preferences) {
        state.preferences = { ...state.preferences, ...action.payload };
      }
    },
  },
});

export const { setLoading, setPreferences, setError, clearError, updatePreference } = preferencesSlice.actions;
export default preferencesSlice.reducer;