import { createSlice } from "@reduxjs/toolkit";
import { fetchUnits, createUnit } from "./unitThunks";

const initialState = {
  units: [],
  loading: false,
  error: null,
};

const unitSlice = createSlice({
  name: "units",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnits.fulfilled, (state, action) => {
        state.loading = false;
        state.units = action.payload;
      })
      .addCase(fetchUnits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createUnit.fulfilled, (state, action) => {
        state.units.push(action.payload);
      });
  },
});

export const { clearError } = unitSlice.actions;
export default unitSlice.reducer;