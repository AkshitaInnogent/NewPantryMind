package com.innogent.pantry_mind.dto.response;

import com.innogent.pantry_mind.entity.ShoppingListItem;
import lombok.Data;
import java.util.Date;

@Data
public class ShoppingListItemResponseDTO {
    private Long id;
    private String itemName;
    private Long quantity;
    private String unit;
    private String category;
    private Boolean isPurchased;
    private ShoppingListItem.Priority priority;
    private ShoppingListItem.Source source;
    private Date createdAt;
    private String createdByName;
    private Long kitchenId;
    private String kitchenName;
}
