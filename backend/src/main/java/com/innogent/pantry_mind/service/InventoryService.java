package com.innogent.pantry_mind.service;

import com.innogent.pantry_mind.dto.request.ConsumeItemsRequestDTO;
import com.innogent.pantry_mind.dto.request.CreateInventoryItemRequestDTO;
import com.innogent.pantry_mind.dto.request.UpdateInventoryItemRequestDTO;
import com.innogent.pantry_mind.dto.request.UpdateInventoryAlertsRequestDTO;
import com.innogent.pantry_mind.dto.response.ConsumeItemsResponseDTO;
import com.innogent.pantry_mind.dto.response.InventoryConsumptionInfoDTO;
import com.innogent.pantry_mind.dto.response.InventoryItemResponseDTO;
import com.innogent.pantry_mind.dto.response.InventoryResponseDTO;
import com.innogent.pantry_mind.entity.AiExtractedItems;
import com.innogent.pantry_mind.entity.InventoryItem;

import java.util.List;

public interface InventoryService {

    InventoryItemResponseDTO addInventoryItem(CreateInventoryItemRequestDTO dto);

    List<InventoryResponseDTO> getAllInventoryItems();

    InventoryResponseDTO getInventoryItemById(Long id);

    InventoryItemResponseDTO updateInventoryItem(Long itemId, UpdateInventoryItemRequestDTO dto);

    void deleteInventoryItem(Long id);

    InventoryItemResponseDTO getInventoryItemByItemId(Long itemId);
    
    InventoryResponseDTO updateInventoryAlerts(Long inventoryId, UpdateInventoryAlertsRequestDTO dto);
    
    List<InventoryResponseDTO> getInventoryItemsByKitchen(Long kitchenId);
    

    
    InventoryItem addItemFromOcr(AiExtractedItems aiItem, Long userId);
    

    
    ConsumeItemsResponseDTO consumeItems(ConsumeItemsRequestDTO dto);
    
    InventoryConsumptionInfoDTO getConsumptionInfo(Long inventoryId);
    
    List<InventoryItemResponseDTO> getExpiredItems(Long kitchenId);
}
