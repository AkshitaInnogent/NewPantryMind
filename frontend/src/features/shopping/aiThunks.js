// frontend/src/features/shopping/aiThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchAISuggestions = createAsyncThunk(
  "shopping/fetchAISuggestions",
  async (kitchenId) => {
    const response = await api.post("/ai/shopping-suggestions", { kitchenId });
    return response.data;
  }
);

export const analyzeConsumptionPatterns = createAsyncThunk(
  "shopping/analyzeConsumption",
  async (kitchenId) => {
    const response = await api.post("/ai/analyze-consumption", { kitchenId });
    return response.data;
  }
);

export const generateSeasonalRecipes = createAsyncThunk(
  "recipes/generateSeasonal",
  async ({ kitchenId, season, servings }) => {
    const response = await api.post("/ai/seasonal-recipes", {
      kitchenId,
      season,
      servings
    });
    return response.data;
  }
);

export const generateLowStockRecipes = createAsyncThunk(
  "recipes/generateLowStock",
  async ({ kitchenId, servings }) => {
    const response = await api.post("/ai/low-stock-recipes", {
      kitchenId,
      servings
    });
    return response.data;
  }
);
