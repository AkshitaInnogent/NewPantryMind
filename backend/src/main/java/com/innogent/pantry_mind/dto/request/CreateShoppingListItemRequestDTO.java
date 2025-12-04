package com.innogent.pantry_mind.dto.request;

import com.innogent.pantry_mind.entity.ShoppingListItem;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class CreateShoppingListItemRequestDTO {
    @NotNull(message = "Kitchen ID is required")
    private Long kitchenId;
    
    @NotBlank(message = "Item name is required")
    private String itemName;
    
    @Positive(message = "Quantity must be positive")
    private Long quantity = 1L;
    
    private String unit;
    private String category;
    private ShoppingListItem.Priority priority = ShoppingListItem.Priority.MEDIUM;
    private ShoppingListItem.Source source = ShoppingListItem.Source.MANUAL;
}
