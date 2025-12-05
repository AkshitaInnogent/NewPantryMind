package com.innogent.pantry_mind.service;

import com.innogent.pantry_mind.dto.response.RecipeResponseDTO;

public interface RecipeService {
    RecipeResponseDTO generateRecipes(Long kitchenId, Integer servings);
}