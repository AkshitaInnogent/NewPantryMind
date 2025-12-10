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
public class ShoppingSuggestionDTO {
    private String itemName;
    private BigDecimal suggestedQuantity;
    private String unitName;
    private Long unitId;
    private String reason;
    private BigDecimal confidenceScore;
}
