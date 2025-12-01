package com.innogent.pantry_mind.mapper;

import com.innogent.pantry_mind.dto.request.CreateInventoryItemRequestDTO;
import com.innogent.pantry_mind.dto.response.InventoryItemResponseDTO;
import com.innogent.pantry_mind.dto.request.UpdateInventoryItemRequestDTO;
import com.innogent.pantry_mind.entity.InventoryItem;
import com.innogent.pantry_mind.entity.Category;
import com.innogent.pantry_mind.entity.Unit;
import com.innogent.pantry_mind.repository.CategoryRepository;
import com.innogent.pantry_mind.repository.UnitRepository;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = "spring")
public abstract class InventoryItemMapper {

    @Autowired
    protected CategoryRepository categoryRepository;
    
    @Autowired
    protected UnitRepository unitRepository;

    @Mapping(target = "categoryId", source = "category", qualifiedByName = "categoryToId")
    @Mapping(target = "unitId", source = "unit", qualifiedByName = "unitToId")
    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "unitName", source = "unit.name")
    public abstract InventoryItemResponseDTO toResponse(InventoryItem entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "category", source = "categoryId", qualifiedByName = "idToCategory")
    @Mapping(target = "unit", source = "unitId", qualifiedByName = "idToUnit")
    public abstract InventoryItem toEntity(CreateInventoryItemRequestDTO dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "kitchenId", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "category", source = "categoryId", qualifiedByName = "idToCategory")
    @Mapping(target = "unit", source = "unitId", qualifiedByName = "idToUnit")
    public abstract void updateEntity(@MappingTarget InventoryItem entity, UpdateInventoryItemRequestDTO dto);

    @Named("categoryToId")
    protected Long categoryToId(Category category) {
        return category != null ? category.getId() : null;
    }

    @Named("unitToId")
    protected Long unitToId(Unit unit) {
        return unit != null ? unit.getId() : null;
    }

    @Named("idToCategory")
    protected Category idToCategory(Long categoryId) {
        return categoryId != null ? categoryRepository.findById(categoryId).orElse(null) : null;
    }

    @Named("idToUnit")
    protected Unit idToUnit(Long unitId) {
        return unitId != null ? unitRepository.findById(unitId).orElse(null) : null;
    }
}
