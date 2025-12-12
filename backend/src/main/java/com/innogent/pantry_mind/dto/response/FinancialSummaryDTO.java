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
public class FinancialSummaryDTO {
    private BigDecimal currentPantryValue;
    private BigDecimal monthlyAdditions;
    private BigDecimal wasteValue;
    private BigDecimal averageItemPrice;
    private Double wastePercentage;
}