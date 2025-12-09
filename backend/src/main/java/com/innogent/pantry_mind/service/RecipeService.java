package com.innogent.pantry_mind.service;

import com.innogent.pantry_mind.dto.response.RecipeResponseDTO;
import java.util.List;

public interface RecipeService {
    RecipeResponseDTO generateRecipes(Long kitchenId, Integer servings);
    void consumeIngredients(Long kitchenId, List<String> ingredients);
}
