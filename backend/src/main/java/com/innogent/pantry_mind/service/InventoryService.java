package com.innogent.pantry_mind.service;

import com.innogent.pantry_mind.dto.request.CreateInventoryItemRequestDTO;
import com.innogent.pantry_mind.dto.request.UpdateInventoryItemRequestDTO;
import com.innogent.pantry_mind.dto.response.InventoryItemResponseDTO;
import com.innogent.pantry_mind.dto.response.InventoryResponseDTO;

import java.util.List;

public interface InventoryService {

    InventoryItemResponseDTO addInventoryItem(CreateInventoryItemRequestDTO dto);

    List<InventoryResponseDTO> getAllInventoryItems();

    InventoryResponseDTO getInventoryItemById(Long id);

    InventoryItemResponseDTO updateInventoryItem(Long itemId, UpdateInventoryItemRequestDTO dto);

    void deleteInventoryItem(Long id);

    InventoryItemResponseDTO getInventoryItemByItemId(Long itemId);
}
