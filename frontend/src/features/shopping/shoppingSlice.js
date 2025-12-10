// frontend/src/features/shopping/shoppingSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { 
  fetchShoppingLists, 
  createShoppingList, 
  fetchShoppingListById, 
  addItemToList, 
  updateItem,
  deleteItem,
  updateItemStatus,
  generateAISuggestions,
  addAllLowStockItems,
  getLowStockItems,
  markAsPurchased
} from "./shoppingThunks";

const initialState = {
  lists: [],
  currentList: null,
  loading: false,
  error: null,
};

const shoppingSlice = createSlice({
  name: "shopping",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentList: (state) => {
      state.currentList = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch shopping lists
      .addCase(fetchShoppingLists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShoppingLists.fulfilled, (state, action) => {
        state.loading = false;
        state.lists = action.payload;
      })
      .addCase(fetchShoppingLists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Add item to list
      .addCase(addItemToList.fulfilled, (state, action) => {
        const item = action.payload;
        const listIndex = state.lists.findIndex(list => list.id === item.shoppingListId);
        if (listIndex !== -1) {
          state.lists[listIndex].items = state.lists[listIndex].items || [];
          state.lists[listIndex].items.push(item);
        }
      })
      
      // Update item
      .addCase(updateItem.fulfilled, (state, action) => {
        state.lists.forEach(list => {
          if (list.items) {
            const item = list.items.find(item => item.id === action.payload.id);
            if (item) {
              Object.assign(item, action.payload);
            }
          }
        });
      })
      
      // Delete item
      .addCase(deleteItem.fulfilled, (state, action) => {
        state.lists.forEach(list => {
          if (list.items) {
            list.items = list.items.filter(item => item.id !== action.payload);
          }
        });
      })
      
      // Generate AI suggestions
      .addCase(generateAISuggestions.fulfilled, (state, action) => {
        const listIndex = state.lists.findIndex(list => list.id === action.payload.listId);
        if (listIndex !== -1) {
          state.lists[listIndex].items = [...(state.lists[listIndex].items || []), ...action.payload.items];
        }
      });
  },
});

export const { clearError, clearCurrentList } = shoppingSlice.actions;
export default shoppingSlice.reducer;
