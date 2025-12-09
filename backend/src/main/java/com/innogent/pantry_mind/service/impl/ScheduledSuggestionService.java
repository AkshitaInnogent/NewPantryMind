package com.innogent.pantry_mind.service.impl;

import com.innogent.pantry_mind.entity.Kitchen;
import com.innogent.pantry_mind.entity.ShoppingList;
import com.innogent.pantry_mind.entity.ShoppingListItem;
import com.innogent.pantry_mind.repository.KitchenRepository;
import com.innogent.pantry_mind.repository.ShoppingListRepository;
import com.innogent.pantry_mind.repository.ShoppingListItemRepository;
import com.innogent.pantry_mind.service.SuggestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduledSuggestionService {

    private final SuggestionService suggestionService;
    private final KitchenRepository kitchenRepository;
    private final ShoppingListRepository shoppingListRepository;
    private final ShoppingListItemRepository shoppingListItemRepository;

    @Scheduled(cron = "0 0 8 * * *") // Daily at 8 AM
    @Transactional
    public void generateDailySuggestions() {
        List<Kitchen> kitchens = kitchenRepository.findAll();
        
        for (Kitchen kitchen : kitchens) {
            try {
                generateSuggestionsForKitchen(kitchen);
            } catch (Exception e) {
                System.err.println("Failed to generate suggestions for kitchen " + kitchen.getId() + ": " + e.getMessage());
            }
        }
    }

    private void generateSuggestionsForKitchen(Kitchen kitchen) {
        // Get or create DAILY shopping list
        ShoppingList dailyList = shoppingListRepository
            .findByKitchenIdAndListType(kitchen.getId(), ShoppingList.ListType.DAILY)
            .orElseGet(() -> {
                ShoppingList list = ShoppingList.builder()
                    .listType(ShoppingList.ListType.DAILY)
                    .kitchen(kitchen)
                    .status(ShoppingList.ListStatus.ACTIVE)
                    .build();
                return shoppingListRepository.save(list);
            });
        
        // Generate and add suggestions
        var suggestions = suggestionService.generateRuleSuggestions(kitchen.getId());
        
        for (var suggestion : suggestions) {
            // Check if item already exists in list
            boolean exists = shoppingListItemRepository.findByShoppingListId(dailyList.getId())
                .stream()
                .anyMatch(item -> item.getCanonicalName().equals(suggestion.getCanonicalName()) 
                    && item.getStatus() == ShoppingListItem.ItemStatus.PENDING);
            
            if (!exists) {
                ShoppingListItem item = ShoppingListItem.builder()
                    .shoppingList(dailyList)
                    .canonicalName(suggestion.getCanonicalName())
                    .suggestedQuantity(suggestion.getSuggestedQuantity())
                    .suggestedBy(ShoppingListItem.SuggestionSource.RULE)
                    .suggestionReason(suggestion.getSuggestionReason())
                    .confidenceScore(suggestion.getConfidenceScore())
                    .status(ShoppingListItem.ItemStatus.PENDING)
                    .build();
                    
                shoppingListItemRepository.save(item);
            }
        }
    }
}
