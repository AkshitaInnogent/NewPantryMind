package com.innogent.pantry_mind.dto.response;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ShoppingListResponseDTO {
    private Long id;
    private String listType;
    private String status;
    private Long kitchenId;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ShoppingListItemResponseDTO> items;
    private Long totalItems;
    private Long pendingItems;
}
