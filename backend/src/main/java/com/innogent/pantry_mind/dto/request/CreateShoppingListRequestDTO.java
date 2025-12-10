package com.innogent.pantry_mind.dto.request;

import com.innogent.pantry_mind.entity.ShoppingList;
import lombok.Data;

@Data
public class CreateShoppingListRequestDTO {
    private Long kitchenId;
    private ShoppingList.ListType listType;
}
