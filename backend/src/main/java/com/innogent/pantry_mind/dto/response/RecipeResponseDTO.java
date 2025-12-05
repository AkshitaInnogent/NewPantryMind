package com.innogent.pantry_mind.dto.response;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class RecipeResponseDTO {
    private List<Recipe> recipes; // Changed to list of recipes
    
    @Data
    public static class Recipe {
        private String name;
        private List<String> ingredients;
        
        @JsonProperty("missing_items")
        private List<String> missingItems;
        
        private List<String> steps;
        private Integer servings;
        
        @JsonProperty("cooking_time")
        private String cookingTime;
    }
}