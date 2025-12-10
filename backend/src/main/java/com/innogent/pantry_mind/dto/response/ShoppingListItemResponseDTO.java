package com.innogent.pantry_mind.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ShoppingListItemResponseDTO {
    private Long id;
    private Long shoppingListId;
    private String canonicalName;
    private String rawName;
    private BigDecimal suggestedQuantity;
    private UnitResponseDTO unit;
    private String unitName;
    private String suggestedBy;
    private String suggestionReason;
    private String status;
    private LocalDateTime purchasedAt;
    private BigDecimal confidenceScore;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
