package com.innogent.pantry_mind.mapper;

import com.innogent.pantry_mind.dto.response.ShoppingListResponseDTO;
import com.innogent.pantry_mind.dto.response.ShoppingListItemResponseDTO;
import com.innogent.pantry_mind.entity.ShoppingList;
import com.innogent.pantry_mind.entity.ShoppingListItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ShoppingListMapper {

    @Mapping(source = "kitchen.id", target = "kitchenId")
    @Mapping(target = "createdByName", expression = "java(shoppingList.getCreatedBy() != null ? shoppingList.getCreatedBy().getName() : null)")
    @Mapping(target = "totalItems", expression = "java(shoppingList.getItems() != null ? (long) shoppingList.getItems().size() : 0L)")
    @Mapping(target = "pendingItems", expression = "java(countPendingItems(shoppingList))")
    ShoppingListResponseDTO toResponseDTO(ShoppingList shoppingList);

    @Mapping(source = "shoppingList.id", target = "shoppingListId")
    @Mapping(source = "rawName", target = "rawName")
    @Mapping(source = "unit", target = "unit")
    @Mapping(source = "status", target = "status")
    @Mapping(source = "purchasedAt", target = "purchasedAt")
    @Mapping(source = "suggestedBy", target = "suggestedBy")
    @Mapping(target = "unitName", expression = "java(item.getUnit() != null ? item.getUnit().getName() : null)")
    ShoppingListItemResponseDTO toItemResponseDTO(ShoppingListItem item);

    default Long countPendingItems(ShoppingList shoppingList) {
        if (shoppingList.getItems() == null) return 0L;
        return shoppingList.getItems().stream()
            .filter(item -> item.getStatus() == ShoppingListItem.ItemStatus.PENDING)
            .count();
    }
}
