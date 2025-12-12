package com.innogent.pantry_mind.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpiryAlertSuccessDTO {
    private List<AlertItem> alertItems;
    private Long totalAlerts;
    private Long itemsSaved;
    private Long itemsWasted;
    private BigDecimal valueSaved;
    private BigDecimal valueWasted;
    private Double successRate;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AlertItem {
        private String itemName;
        private BigDecimal value;
        private LocalDate expiryDate;
        private String status; // SAVED, WASTED, PENDING
        private Integer daysLeft;
    }
}