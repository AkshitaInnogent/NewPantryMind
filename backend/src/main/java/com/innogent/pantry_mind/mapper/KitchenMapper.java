package com.innogent.pantry_mind.mapper;

import com.innogent.pantry_mind.dto.request.KitchenRequestDTO;
import com.innogent.pantry_mind.dto.response.KitchenResponseDTO;
import com.innogent.pantry_mind.entity.Kitchen;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface KitchenMapper {
    KitchenResponseDTO toResponse(Kitchen kitchen);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "users", ignore = true)
    Kitchen toEntity(KitchenRequestDTO request);
}
