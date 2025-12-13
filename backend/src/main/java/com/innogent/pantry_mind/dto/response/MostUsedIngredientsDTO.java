package com.innogent.pantry_mind.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MostUsedIngredientsDTO {
    private List<IngredientUsage> ingredients;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IngredientUsage {
        private String itemName;
        private BigDecimal totalConsumed;
        private String unit;
        private Long consumptionCount;
    }
}