package com.innogent.pantry_mind.service;

import com.innogent.pantry_mind.dto.response.ShoppingListItemResponseDTO;
import com.innogent.pantry_mind.dto.response.RecipeResponseDTO;
import java.util.List;
import java.util.Map;

public interface AIService {
    
    boolean isAIAvailable();
    
    List<ShoppingListItemResponseDTO> generateAISuggestions(Long kitchenId);
    
    List<ShoppingListItemResponseDTO> generateAISuggestionsForListType(Long kitchenId, String listType, List<String> existingItems);
    
    Map<String, Object> analyzeConsumptionPatterns(Long kitchenId);
    
    List<String> generateSmartRecipeRecommendations(Long kitchenId, Integer servings);
    
    RecipeResponseDTO generateSeasonalRecipes(Long kitchenId, String season, Integer servings);
    
    RecipeResponseDTO generateLowStockRecipes(Long kitchenId, Integer servings);
}
