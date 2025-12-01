package com.innogent.pantry_mind.service;

import com.innogent.pantry_mind.dto.request.CreateInventoryItemRequestDTO;
import com.innogent.pantry_mind.dto.response.InventoryItemResponseDTO;
import com.innogent.pantry_mind.dto.request.UpdateInventoryItemRequestDTO;

import java.util.List;

public interface InventoryService {

    InventoryItemResponseDTO addInventoryItem(CreateInventoryItemRequestDTO dto);

    List<InventoryItemResponseDTO> getAllInventoryItems();

    InventoryItemResponseDTO getInventoryItemById(Long id);

    InventoryItemResponseDTO updateInventoryItem(UpdateInventoryItemRequestDTO dto, Long id);

    void deleteInventoryItem(Long id);
}
