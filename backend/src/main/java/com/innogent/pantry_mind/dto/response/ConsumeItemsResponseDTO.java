package com.innogent.pantry_mind.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Data
@Builder
public class ConsumeItemsResponseDTO {
    private List<ConsumedItemDetail> consumedItems;
    private Integer totalItemsConsumed;
    
    @Data
    @Builder
    public static class ConsumedItemDetail {
        private Long inventoryId;
        private String itemName;
        private BigDecimal totalConsumed;
        private String unit;
        private List<ItemConsumptionDetail> itemDetails;
    }
    
    @Data
    @Builder
    public static class ItemConsumptionDetail {
        private Long itemId;
        private Date expiryDate;
        private Long addedBy;
        private String addedByName;
        private BigDecimal quantityConsumed;
        private BigDecimal remainingQuantity;
    }
}