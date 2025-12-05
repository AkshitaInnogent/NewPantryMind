package com.innogent.pantry_mind.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class RecipeRequestDTO {
    private List<InventoryItemDTO> items;
    private Integer servings; // Number of members/people
    
    @Data
    public static class InventoryItemDTO {
        private String name;
        private Long quantity;
        private String unit;
    }
}