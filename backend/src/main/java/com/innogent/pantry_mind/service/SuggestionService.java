package com.innogent.pantry_mind.service;

import com.innogent.pantry_mind.dto.response.ShoppingListItemResponseDTO;
import java.util.List;

public interface SuggestionService {
    
    List<ShoppingListItemResponseDTO> generateRuleSuggestions(Long kitchenId);
    
    void recordConsumption(String itemName, Long kitchenId, String quantity, String reason, Long userId);
    
    void createOrUpdateRule(String itemName, Long kitchenId, String threshold, String suggestedQty);
}
