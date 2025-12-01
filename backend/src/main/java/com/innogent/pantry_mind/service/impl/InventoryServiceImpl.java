package com.innogent.pantry_mind.service.impl;

import com.innogent.pantry_mind.dto.request.CreateInventoryItemRequestDTO;
import com.innogent.pantry_mind.dto.response.InventoryItemResponseDTO;
import com.innogent.pantry_mind.dto.request.UpdateInventoryItemRequestDTO;
import com.innogent.pantry_mind.entity.InventoryItem;
import com.innogent.pantry_mind.mapper.InventoryItemMapper;
import com.innogent.pantry_mind.repository.InventoryItemRepository;
import com.innogent.pantry_mind.service.InventoryService;
import com.innogent.pantry_mind.exception.ItemNotFoundException;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryItemRepository inventoryItemRepository;
    private final InventoryItemMapper mapper;

    @Override
    public InventoryItemResponseDTO addInventoryItem(CreateInventoryItemRequestDTO dto) {
        InventoryItem entity = mapper.toEntity(dto);
        InventoryItem saved = inventoryItemRepository.save(entity);
        return mapper.toResponse(saved);
    }

    @Override
    public List<InventoryItemResponseDTO> getAllInventoryItems() {
        return inventoryItemRepository.findAll().stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public InventoryItemResponseDTO getInventoryItemById(Long id) {
        return inventoryItemRepository.findById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ItemNotFoundException(id));
    }

    @Override
    public InventoryItemResponseDTO updateInventoryItem(UpdateInventoryItemRequestDTO dto, Long id) {
        InventoryItem entity = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ItemNotFoundException(id));

        mapper.updateEntity(entity, dto);

        InventoryItem updated = inventoryItemRepository.save(entity);
        return mapper.toResponse(updated);
    }

    @Override
    public void deleteInventoryItem(Long id) {
        if (!inventoryItemRepository.existsById(id)) {
            throw new ItemNotFoundException(id);
        }
        inventoryItemRepository.deleteById(id);
    }

    public List<InventoryItemResponseDTO> getInventoryItemsByKitchen(Long kitchenId) {
        return inventoryItemRepository.findByKitchenId(kitchenId).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }
}