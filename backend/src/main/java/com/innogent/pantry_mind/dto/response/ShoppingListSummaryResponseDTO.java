package com.innogent.pantry_mind.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class ShoppingListSummaryResponseDTO {
    private Long kitchenId;
    private String kitchenName;
    private Integer totalItems;
    private Integer purchasedItems;
    private Integer pendingItems;
    private List<ShoppingListItemResponseDTO> highPriorityItems;
    private List<ShoppingListItemResponseDTO> mediumPriorityItems;
    private List<ShoppingListItemResponseDTO> lowPriorityItems;
    private List<ShoppingListItemResponseDTO> purchasedItemsList;
}
