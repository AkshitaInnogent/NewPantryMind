import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setItems: (state, action) => {
      state.items = action.payload;
    },
    addItem: (state, action) => {
      state.items.push(action.payload);
    },
    updateItem: (state, action) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    removeItem: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    consumeItems: (state, action) => {
      action.payload.forEach(({ id, consumedQuantity }) => {
        const item = state.items.find(item => item.id === id);
        if (item && item.quantity >= consumedQuantity) {
          item.quantity -= consumedQuantity;
          if (item.quantity === 0) {
            state.items = state.items.filter(i => i.id !== id);
          }
        }
      });
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setLoading, setItems, addItem, updateItem, removeItem, consumeItems, setError, clearError } = inventorySlice.actions;
export default inventorySlice.reducer;
