package com.innogent.pantry_mind.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class AdvancedRecipeRequestDTO {
    private List<InventoryItemDTO> items; // .....
    private Integer servings = 4; // .....
    private Long userId; // .....
    private String category;
    private String recipeType; // REGULAR, EXPIRY_BASED, QUICK, WASTAGE_PREVENTION
    private Integer maxCookingTime;
    private String skillLevel; // BEGINNER, INTERMEDIATE, ADVANCED
    private List<String> dietaryRestrictions;
    private List<String> cuisinePreferences;
    private List<InventoryItemDTO> expiringItems; // ....
    private List<InventoryItemDTO> lowStockItems;
    
    @Data
    public static class InventoryItemDTO {
        private String name;
        private Long quantity;
        private String unit;
        private String expiryDate; // ISO date string
        private Boolean isExpiring;
        private Boolean isLowStock;
    }
}