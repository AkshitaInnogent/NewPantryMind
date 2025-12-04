import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  recipe: null,
  loading: false,
  error: null,
};

const recipeSlice = createSlice({
  name: "recipes",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setRecipe: (state, action) => {
      state.recipe = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearRecipe: (state) => {
      state.recipe = null;
    },
  },
});

export const { setLoading, setRecipe, setError, clearError, clearRecipe } = recipeSlice.actions;
export default recipeSlice.reducer;