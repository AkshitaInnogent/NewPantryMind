package com.innogent.pantry_mind.mapper;

import com.innogent.pantry_mind.dto.response.ShoppingListItemResponseDTO;
import com.innogent.pantry_mind.entity.ShoppingListItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ShoppingListMapper {
    
    @Mapping(source = "createdBy.name", target = "createdByName")
    @Mapping(source = "kitchen.id", target = "kitchenId")
    @Mapping(source = "kitchen.name", target = "kitchenName")
    ShoppingListItemResponseDTO toResponseDTO(ShoppingListItem entity);
}
