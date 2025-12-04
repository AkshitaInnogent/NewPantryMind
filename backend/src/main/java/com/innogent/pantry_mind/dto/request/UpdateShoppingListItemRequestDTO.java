package com.innogent.pantry_mind.dto.request;

import com.innogent.pantry_mind.entity.ShoppingListItem;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class UpdateShoppingListItemRequestDTO {
    @NotBlank(message = "Item name is required")
    private String itemName;
    
    @Positive(message = "Quantity must be positive")
    private Long quantity;
    
    private String unit;
    private String category;
    private ShoppingListItem.Priority priority;
    private Boolean isPurchased;
}
