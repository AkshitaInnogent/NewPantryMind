package com.innogent.pantry_mind.mapper;

import com.innogent.pantry_mind.dto.request.CategoryRequestDTO;
import com.innogent.pantry_mind.dto.response.CategoryResponseDTO;
import com.innogent.pantry_mind.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    CategoryResponseDTO toResponse(Category category);
    
    @Mapping(target = "id", ignore = true)
    Category toEntity(CategoryRequestDTO request);
}
