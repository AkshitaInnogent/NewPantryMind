package com.innogent.pantry_mind.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MoneyFlowDTO {
    private BigDecimal totalSpent;
    private BigDecimal totalConsumed;
    private BigDecimal totalWasted;
    private BigDecimal savedFromAlerts;
    private Double wastePercentage;
    private Double savingsPercentage;
}