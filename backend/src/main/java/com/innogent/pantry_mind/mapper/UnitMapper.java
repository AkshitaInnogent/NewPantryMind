package com.innogent.pantry_mind.mapper;

import com.innogent.pantry_mind.dto.request.UnitRequestDTO;
import com.innogent.pantry_mind.dto.response.UnitResponseDTO;
import com.innogent.pantry_mind.entity.Unit;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UnitMapper {
    UnitResponseDTO toResponse(Unit unit);

    @Mapping(target = "id", ignore = true)
    Unit toEntity(UnitRequestDTO request);
}
