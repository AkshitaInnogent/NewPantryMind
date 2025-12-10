package com.innogent.pantry_mind.service;

import com.innogent.pantry_mind.dto.request.AddToInventoryRequest;
import com.innogent.pantry_mind.dto.request.CreateShoppingListRequestDTO;
import com.innogent.pantry_mind.dto.request.AddShoppingListItemRequestDTO;
import com.innogent.pantry_mind.dto.request.UpdateShoppingListItemRequestDTO;
import com.innogent.pantry_mind.dto.response.ShoppingListResponseDTO;
import com.innogent.pantry_mind.dto.response.ShoppingListItemResponseDTO;
import com.innogent.pantry_mind.dto.response.ShoppingSuggestionDTO;

import java.util.List;
import java.util.Map;

public interface ShoppingListService {
    List<ShoppingListResponseDTO> getOrCreateFixedLists(Long kitchenId);
    List<ShoppingListResponseDTO> getShoppingListsByKitchen(Long kitchenId);
    ShoppingListResponseDTO createShoppingList(CreateShoppingListRequestDTO dto, Long userId);
    void deleteShoppingList(Long id);
    ShoppingListResponseDTO getShoppingListById(Long id);
    
    ShoppingListItemResponseDTO addItemToList(AddShoppingListItemRequestDTO dto, Long userId);
    ShoppingListItemResponseDTO updateItemQuantity(Long itemId, UpdateShoppingListItemRequestDTO dto);
    ShoppingListItemResponseDTO updateItemStatus(Long itemId, String status);
    void deleteShoppingListItem(Long itemId);
    
    List<ShoppingSuggestionDTO> getAISuggestions(Long listId, Long kitchenId, Long userId);
    List<ShoppingListItemResponseDTO> generateAISuggestions(Long listId, Long kitchenId, Long userId);
    List<ShoppingListItemResponseDTO> addSuggestionsToList(Long listId, List<ShoppingSuggestionDTO> suggestions, Long userId);
    Map<String, Object> addAllLowStockItems(Long listId, Long kitchenId, Long userId);
    List<ShoppingListItemResponseDTO> addSelectedItems(Long listId, List<String> itemNames, Long userId);
    
    Map<String, Object> markAsPurchasedAndUpdateInventory(Long itemId, String actualQuantity, Long userId);
    List<Map<String, Object>> getLowStockItems(Long kitchenId);
    void addItemToInventory(Long listId, Long itemId, AddToInventoryRequest request);
    
    // New methods for purchased items management
    ShoppingListItemResponseDTO markItemAsPurchased(Long itemId);
    List<ShoppingListItemResponseDTO> markMultipleItemsAsPurchased(List<Long> itemIds);
    void cleanupPurchasedItems();
    
    // AI consumption data
    Map<String, Object> getConsumptionDataForAI(Long kitchenId);
}
