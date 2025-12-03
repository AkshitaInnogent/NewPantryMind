package com.innogent.pantry_mind.mapper;

import com.innogent.pantry_mind.dto.response.InventoryItemResponseDTO;
import com.innogent.pantry_mind.entity.InventoryItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface InventoryItemMapper {

    @Mapping(source = "inventory.id", target = "inventoryId")
    @Mapping(source = "location.id", target = "locationId")
    @Mapping(source = "location.name", target = "locationName")
    @Mapping(target = "createdByName", expression = "java(inventoryItem.getCreatedByUser() != null ? inventoryItem.getCreatedByUser().getName() : null)")
    InventoryItemResponseDTO toResponseDTO(InventoryItem inventoryItem);
}
