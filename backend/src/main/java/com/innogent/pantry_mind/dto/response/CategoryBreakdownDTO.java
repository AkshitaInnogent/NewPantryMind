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
public class CategoryBreakdownDTO {
    private List<CategoryData> categories;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryData {
        private String categoryName;
        private Long itemCount;
        private BigDecimal totalValue;
        private Double percentage;
    }
}