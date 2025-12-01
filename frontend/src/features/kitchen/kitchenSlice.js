import { createSlice } from "@reduxjs/toolkit";
import { createKitchenWithAdmin, joinKitchen, getUserKitchens } from "./kitchenThunks";

const kitchenSlice = createSlice({
  name: "kitchen",
  initialState: {
    currentKitchen: null,
    kitchens: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError(state) {
      state.error = null;
    },
    setCurrentKitchen(state, action) {
      state.currentKitchen = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE KITCHEN WITH ADMIN
      .addCase(createKitchenWithAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createKitchenWithAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.currentKitchen = action.payload;
        state.kitchens.push(action.payload);
      })
      .addCase(createKitchenWithAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // JOIN KITCHEN
      .addCase(joinKitchen.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinKitchen.fulfilled, (state, action) => {
        state.loading = false;
        state.currentKitchen = action.payload;
        if (!state.kitchens.find(k => k.id === action.payload.id)) {
          state.kitchens.push(action.payload);
        }
      })
      .addCase(joinKitchen.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setCurrentKitchen } = kitchenSlice.actions;
export default kitchenSlice.reducer;
