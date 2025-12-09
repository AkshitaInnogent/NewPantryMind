package com.innogent.pantry_mind.dto.request;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class AddShoppingListItemRequestDTO {
    private Long shoppingListId;
    private String itemName;
    private BigDecimal quantity;
    private Long unitId;
}
