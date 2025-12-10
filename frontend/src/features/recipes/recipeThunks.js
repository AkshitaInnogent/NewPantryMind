import { setLoading, setRecipe, setError } from "./recipeSlice";
import axiosClient from "../../services/api";

export const generateRecipes = (kitchenId, servings = 4, category = null) => async (dispatch) => {
  console.log("🚀 [FRONTEND] Starting recipe generation for kitchenId:", kitchenId, "servings:", servings, "category:", category);
  
  dispatch(setLoading(true));
  dispatch(setError(null));
  
  try {
    let url = `/recipes/suggest/${kitchenId}?servings=${servings}`;
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }
    console.log("📡 [FRONTEND] Making API call to:", url);
    console.log("📝 [FRONTEND] Request params:", {
      kitchenId,
      servings,
      category
    });
    
    const response = await axiosClient.get(url);
    
    console.log("✅ [FRONTEND] Recipes received from backend:");
    console.log("📊 [FRONTEND] Response status:", response.status);
    console.log("📝 [FRONTEND] FULL RESPONSE DATA:");
    console.log("=".repeat(80));
    console.log(JSON.stringify(response.data, null, 2));
    console.log("=".repeat(80));
    
    if (response.data?.recipes) {
      console.log("🍳 [FRONTEND] RECIPE DETAILS:");
      response.data.recipes.forEach((recipe, index) => {
        console.log(`Recipe ${index + 1}: ${recipe.name}`);
        console.log(`  Servings: ${recipe.servings}`);
        console.log(`  Cooking Time: ${recipe.cooking_time}`);
        console.log(`  Ingredients (${recipe.ingredients?.length || 0}):`, recipe.ingredients);
        console.log(`  Missing Items (${recipe.missing_items?.length || 0}):`, recipe.missing_items);
        console.log(`  Steps (${recipe.steps?.length || 0}):`, recipe.steps);
        console.log("---");
      });
    }
    
    dispatch(setRecipe(response.data));
    return response.data;
  } catch (error) {
    console.error("❌ [FRONTEND] Recipe generation failed:", error);
    console.error("❌ [FRONTEND] Error response:", error.response?.data);
    console.error("❌ [FRONTEND] Error status:", error.response?.status);
    
    const errorMessage = error.response?.data?.message || "Failed to generate recipes";
    dispatch(setError(errorMessage));
    throw error;
  } finally {
    dispatch(setLoading(false));
    console.log("🏁 [FRONTEND] Recipe generation process completed");
  }
};

export const generateExpiryRecipes = (kitchenId, servings = 4, userId = null) => async (dispatch) => {
  console.log("⏰ [FRONTEND] Starting expiry-based recipe generation");
  
  dispatch(setLoading(true));
  dispatch(setError(null));
  
  try {
    const params = new URLSearchParams({ servings: servings.toString() });
    if (userId) params.append('userId', userId.toString());
    
    const response = await axiosClient.get(`/recipes/expiring/${kitchenId}?${params}`);
    dispatch(setRecipe(response.data));
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to generate expiry recipes";
    dispatch(setError(errorMessage));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export const generateQuickRecipes = (kitchenId, maxTime = 30, servings = 4, userId = null) => async (dispatch) => {
  console.log("⚡ [FRONTEND] Starting quick recipe generation");
  
  dispatch(setLoading(true));
  dispatch(setError(null));
  
  try {
    const params = new URLSearchParams({ 
      maxTime: maxTime.toString(),
      servings: servings.toString()
    });
    if (userId) params.append('userId', userId.toString());
    
    const response = await axiosClient.get(`/recipes/quick/${kitchenId}?${params}`);
    dispatch(setRecipe(response.data));
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to generate quick recipes";
    dispatch(setError(errorMessage));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};



export const generateAdvancedRecipes = (kitchenId, advancedRequest) => async (dispatch) => {
  console.log("🚀 [FRONTEND] Starting advanced recipe generation");
  
  dispatch(setLoading(true));
  dispatch(setError(null));
  
  try {
    const response = await axiosClient.post(`/recipes/advanced/${kitchenId}`, advancedRequest);
    dispatch(setRecipe(response.data));
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to generate advanced recipes";
    dispatch(setError(errorMessage));
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export const generateRecipeByName = (kitchenId, recipeName, servings = 4) => async (dispatch) => {
  console.log("🍳 [FRONTEND] Generating recipe by name:", recipeName);
  console.log("🏠 [FRONTEND] Kitchen ID:", kitchenId);
  console.log("👥 [FRONTEND] Servings:", servings);
  
  dispatch(setLoading(true));
  dispatch(setError(null));
  
  try {
    const params = new URLSearchParams({ 
      recipeName: recipeName,
      servings: servings.toString()
    });
    
    const url = `/recipes/by-name/${kitchenId}?${params}`;
    console.log("📡 [FRONTEND] API URL:", url);
    console.log("📝 [FRONTEND] Request params:", {
      recipeName,
      servings,
      kitchenId
    });
    
    const response = await axiosClient.get(url);
    
    console.log("✅ [FRONTEND] Recipe response received for:", recipeName);
    console.log("📊 [FRONTEND] Response status:", response.status);
    console.log("📝 [FRONTEND] FULL RESPONSE DATA FOR", recipeName.toUpperCase(), ":");
    console.log("=".repeat(80));
    console.log(JSON.stringify(response.data, null, 2));
    console.log("=".repeat(80));
    
    if (response.data?.recipes) {
      console.log(`🍳 [FRONTEND] ${recipeName.toUpperCase()} RECIPE DETAILS:`);
      response.data.recipes.forEach((recipe, index) => {
        console.log(`Recipe ${index + 1}: ${recipe.name}`);
        console.log(`  Servings: ${recipe.servings}`);
        console.log(`  Cooking Time: ${recipe.cooking_time}`);
        console.log(`  Ingredients (${recipe.ingredients?.length || 0}):`, recipe.ingredients);
        console.log(`  Missing Items (${recipe.missing_items?.length || 0}):`, recipe.missing_items);
        console.log(`  Steps (${recipe.steps?.length || 0}):`, recipe.steps);
        console.log("---");
      });
    }
    
    dispatch(setRecipe(response.data));
    return response.data;
  } catch (error) {
    console.error("❌ [FRONTEND] Recipe generation failed:", error);
    console.error("❌ [FRONTEND] Error response:", error.response?.data);
    console.error("❌ [FRONTEND] Error status:", error.response?.status);
    
    const errorMessage = error.response?.data?.message || "Failed to generate recipe";
    dispatch(setError(errorMessage));
    throw error;
  } finally {
    dispatch(setLoading(false));
    console.log("🏁 [FRONTEND] Recipe by name generation completed");
  }
};