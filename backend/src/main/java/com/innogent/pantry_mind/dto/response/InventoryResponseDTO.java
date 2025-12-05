package com.innogent.pantry_mind.dto.response;

import lombok.Data;
import java.util.Date;
import java.util.List;

@Data
public class InventoryResponseDTO {
    private Long id;
    private String name;
    private Long categoryId;
    private String categoryName;
    private Long unitId;
    private String unitName;
    private Long totalQuantity;
    private Integer itemCount;
    private Integer minExpiryDaysAlert;
    private Long minStock;
    private Date earliestExpiry;
    private List<InventoryItemResponseDTO> items;
}