package com.innogent.pantry_mind.dto.response;

import lombok.Data;
import java.util.Date;

@Data
public class InventoryItemResponseDTO {
    private Long id;
    private String name;
    private String description;
    private Long kitchenId;
    private Long categoryId;
    private String categoryName;
    private Long unitId;
    private String unitName;
    private Long createdBy;
    private Long quantity;
    private String location;
    private Date expiryDate;
    private Date createdAt;
}