package com.innogent.pantry_mind.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class UserPreferencesResponseDTO {
    private Long id;
    private List<String> dietaryRestrictions;
    private List<String> cuisinePreferences;
    private String skillLevel;
    private Integer maxCookingTime;
    private String spiceLevel;
    private List<String> avoidIngredients;
}