package com.innogent.pantry_mind.service;

import com.innogent.pantry_mind.dto.request.AdvancedRecipeRequestDTO;
import com.innogent.pantry_mind.dto.response.RecipeResponseDTO;

public interface RecipeService {
    RecipeResponseDTO generateRecipes(Long kitchenId, Integer servings);
    RecipeResponseDTO generateRecipes(Long kitchenId, Integer servings, String category);
    RecipeResponseDTO generateAdvancedRecipes(Long kitchenId, AdvancedRecipeRequestDTO request);
    RecipeResponseDTO generateExpiryBasedRecipes(Long kitchenId, Integer servings, Long userId);
    RecipeResponseDTO generateQuickRecipes(Long kitchenId, Integer maxTime, Integer servings, Long userId);
    RecipeResponseDTO generateRecipeByName(Long kitchenId, String recipeName, Integer servings);

}
