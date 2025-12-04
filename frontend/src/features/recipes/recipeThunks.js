import { setLoading, setRecipe, setError } from "./recipeSlice";
import axiosClient from "../../services/api";

export const generateRecipes = (kitchenId, servings = 4) => async (dispatch) => {
  console.log("🚀 [FRONTEND] Starting recipe generation for kitchenId:", kitchenId, "servings:", servings);
  
  dispatch(setLoading(true));
  dispatch(setError(null));
  
  try {
    console.log("📡 [FRONTEND] Making API call to /recipes/suggest/" + kitchenId + "?servings=" + servings);
    const response = await axiosClient.get(`/recipes/suggest/${kitchenId}?servings=${servings}`);
    
    console.log("✅ [FRONTEND] Recipes received from backend:", response.data);
    dispatch(setRecipe(response.data));
    return response.data;
  } catch (error) {
    console.error("❌ [FRONTEND] Recipe generation failed:", error);
    console.error("❌ [FRONTEND] Error response:", error.response?.data);
    
    const errorMessage = error.response?.data?.message || "Failed to generate recipes";
    dispatch(setError(errorMessage));
    throw error;
  } finally {
    dispatch(setLoading(false));
    console.log("🏁 [FRONTEND] Recipe generation process completed");
  }
};