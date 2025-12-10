package com.innogent.pantry_mind.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class UserPreferencesRequestDTO {
    private List<String> dietaryRestrictions;
    private List<String> cuisinePreferences;
    private String skillLevel; // BEGINNER, INTERMEDIATE, ADVANCED
    private Integer maxCookingTime;
    private String spiceLevel; // MILD, MEDIUM, SPICY, EXTRA_SPICY
    private List<String> avoidIngredients;
}