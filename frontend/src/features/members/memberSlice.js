import { createSlice } from "@reduxjs/toolkit";
import { fetchKitchenMembers, removeMember } from "./memberThunks";

const initialState = {
  members: [],
  loading: false,
  error: null,
};

const memberSlice = createSlice({
  name: "members",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchKitchenMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchKitchenMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload;
      })
      .addCase(fetchKitchenMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(removeMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeMember.fulfilled, (state, action) => {
        state.loading = false;
        state.members = state.members.filter(member => member.id !== action.payload);
      })
      .addCase(removeMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = memberSlice.actions;
export default memberSlice.reducer;