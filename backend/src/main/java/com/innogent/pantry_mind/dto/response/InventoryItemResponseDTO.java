package com.innogent.pantry_mind.dto.response;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Date;

@Data
public class InventoryItemResponseDTO {
    private Long id;
    private Long inventoryId;
    private String description;
    private Long quantity;
    private Long locationId;
    private String locationName;
    private Date expiryDate;
    private BigDecimal price;
    private Long createdBy;
    private String createdByName;
    private Date createdAt;
}