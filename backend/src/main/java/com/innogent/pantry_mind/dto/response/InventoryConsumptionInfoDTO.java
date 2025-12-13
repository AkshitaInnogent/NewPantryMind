package com.innogent.pantry_mind.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Data
@Builder
public class InventoryConsumptionInfoDTO {
    private Long inventoryId;
    private String itemName;
    private BigDecimal totalAvailable;
    private String unit;
    private List<AvailableItemDetail> availableItems;
    
    @Data
    @Builder
    public static class AvailableItemDetail {
        private Long itemId;
        private BigDecimal quantity;
        private Date expiryDate;
        private String addedByName;
        private Date addedDate;
    }
}