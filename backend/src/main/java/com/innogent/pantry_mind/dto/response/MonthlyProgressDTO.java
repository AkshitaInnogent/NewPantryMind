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
public class MonthlyProgressDTO {
    private List<MonthlyData> monthlyData;
    private BigDecimal totalSaved;
    private Double overallImprovement;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyData {
        private String month;
        private BigDecimal wasteValue;
        private Double improvementPercentage;
        private Long itemsWasted;
    }
}