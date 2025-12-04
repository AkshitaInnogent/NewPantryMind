package com.innogent.pantry_mind.service;

import com.innogent.pantry_mind.dto.request.CreateShoppingListItemRequestDTO;
import com.innogent.pantry_mind.dto.request.GenerateShoppingListRequestDTO;
import com.innogent.pantry_mind.dto.request.UpdateShoppingListItemRequestDTO;
import com.innogent.pantry_mind.dto.response.GenerateShoppingListResponseDTO;
import com.innogent.pantry_mind.dto.response.ShoppingListItemResponseDTO;
import com.innogent.pantry_mind.dto.response.ShoppingListSummaryResponseDTO;

import java.util.List;

public interface ShoppingListService {
    
    List<ShoppingListItemResponseDTO> getShoppingList(Long kitchenId);
    
    ShoppingListSummaryResponseDTO getShoppingListSummary(Long kitchenId);
    
    GenerateShoppingListResponseDTO generateFromLowStock(GenerateShoppingListRequestDTO request);
    
    ShoppingListItemResponseDTO addItem(CreateShoppingListItemRequestDTO request);
    
    ShoppingListItemResponseDTO updateItem(Long id, UpdateShoppingListItemRequestDTO request);
    
    ShoppingListItemResponseDTO togglePurchased(Long id);
    
    void deleteItem(Long id);
    
    void clearPurchasedItems(Long kitchenId);
}
