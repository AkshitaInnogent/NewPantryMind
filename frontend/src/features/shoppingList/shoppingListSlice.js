import { createSlice } from '@reduxjs/toolkit';
import { 
  fetchShoppingList, 
  generateFromLowStock, 
  addShoppingItem, 
  togglePurchased, 
  deleteShoppingItem,
  clearPurchasedItems 
} from './shoppingListThunks';

const shoppingListSlice = createSlice({
  name: 'shoppingList',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShoppingList.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchShoppingList.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchShoppingList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(togglePurchased.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(addShoppingItem.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(deleteShoppingItem.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      .addCase(generateFromLowStock.fulfilled, (state, action) => {
        state.items = [...state.items, ...action.payload.generatedItems];
      })
      .addCase(clearPurchasedItems.fulfilled, (state) => {
        state.items = state.items.filter(item => !item.isPurchased);
      });
  }
});

export const { clearError } = shoppingListSlice.actions;
export default shoppingListSlice.reducer;
