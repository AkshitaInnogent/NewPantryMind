package com.innogent.pantry_mind.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class ItemShoppingPattern {
    private String recommendedListType;
    private BigDecimal suggestedQuantity;
    private String unitName;
    private Long unitId;
    private String reason;
    private BigDecimal confidenceScore;
}
