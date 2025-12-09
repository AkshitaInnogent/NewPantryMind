package com.innogent.pantry_mind.service.impl;

import com.innogent.pantry_mind.dto.response.ShoppingListItemResponseDTO;
import com.innogent.pantry_mind.entity.*;
import com.innogent.pantry_mind.repository.*;
import com.innogent.pantry_mind.service.AIService;
import com.innogent.pantry_mind.service.SuggestionService;
import com.innogent.pantry_mind.util.NameNormalizationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class SuggestionServiceImpl implements SuggestionService {

    private final InventoryRepository inventoryRepository;
    private final SuggestionRuleRepository suggestionRuleRepository;
    private final ConsumptionEventRepository consumptionEventRepository;
    private final KitchenRepository kitchenRepository;
    private final UserRepository userRepository;
    private final UnitRepository unitRepository;
    private final AIService aiService;

    @Override
    public List<ShoppingListItemResponseDTO> generateRuleSuggestions(Long kitchenId) {
        List<ShoppingListItemResponseDTO> suggestions = new ArrayList<>();
        
        // Get rule-based suggestions
        List<ShoppingListItemResponseDTO> ruleSuggestions = generateBasicRuleSuggestions(kitchenId);
        
        // Get AI suggestions if available
        List<ShoppingListItemResponseDTO> aiSuggestions = new ArrayList<>();
        if (aiService.isAIAvailable()) {
            aiSuggestions = aiService.generateAISuggestions(kitchenId);
        }
        
        // Merge suggestions (AI takes priority for same items)
        suggestions.addAll(mergeSuggestions(ruleSuggestions, aiSuggestions));
        
        return suggestions;
    }

    private List<ShoppingListItemResponseDTO> generateBasicRuleSuggestions(Long kitchenId) {
        List<ShoppingListItemResponseDTO> suggestions = new ArrayList<>();
        List<Inventory> inventoryItems = inventoryRepository.findByKitchenId(kitchenId);
        
        for (Inventory inventory : inventoryItems) {
            SuggestionRule rule = suggestionRuleRepository
                .findByCanonicalNameAndKitchenId(inventory.getName(), kitchenId)
                .orElse(createDefaultRule(inventory));
            
            if (isItemLowStock(inventory, rule)) {
                ShoppingListItemResponseDTO suggestion = createRuleSuggestion(inventory, rule);
                suggestions.add(suggestion);
            }
        }
        
        return suggestions;
    }

    private List<ShoppingListItemResponseDTO> mergeSuggestions(
            List<ShoppingListItemResponseDTO> ruleSuggestions,
            List<ShoppingListItemResponseDTO> aiSuggestions) {
        
        List<ShoppingListItemResponseDTO> merged = new ArrayList<>();
        
        // Add AI suggestions first (higher priority)
        merged.addAll(aiSuggestions);
        
        // Add rule suggestions that don't conflict with AI
        for (ShoppingListItemResponseDTO ruleSuggestion : ruleSuggestions) {
            boolean hasAIVersion = aiSuggestions.stream()
                .anyMatch(ai -> ai.getCanonicalName().equals(ruleSuggestion.getCanonicalName()));
            
            if (!hasAIVersion) {
                merged.add(ruleSuggestion);
            }
        }
        
        return merged;
    }

    @Override
    @Transactional
    public void recordConsumption(String itemName, Long kitchenId, String quantity, String reason, Long userId) {
        Kitchen kitchen = kitchenRepository.findById(kitchenId).orElse(null);
        User user = userRepository.findById(userId).orElse(null);
        
        if (kitchen == null || user == null) return;
        
        ConsumptionEvent event = ConsumptionEvent.builder()
            .canonicalName(NameNormalizationUtil.normalizeName(itemName))
            .quantityConsumed(new BigDecimal(quantity))
            .kitchen(kitchen)
            .reason(ConsumptionEvent.EventReason.valueOf(reason))
            .triggeredBy(user)
            .build();
            
        consumptionEventRepository.save(event);
    }

    @Override
    @Transactional
    public void createOrUpdateRule(String itemName, Long kitchenId, String threshold, String suggestedQty) {
        Kitchen kitchen = kitchenRepository.findById(kitchenId).orElse(null);
        if (kitchen == null) return;
        
        String normalizedName = NameNormalizationUtil.normalizeName(itemName);
        
        SuggestionRule rule = suggestionRuleRepository
            .findByCanonicalNameAndKitchenId(normalizedName, kitchenId)
            .orElse(SuggestionRule.builder()
                .canonicalName(normalizedName)
                .kitchen(kitchen)
                .build());
                
        rule.setReorderThreshold(new BigDecimal(threshold));
        rule.setSuggestedQuantity(new BigDecimal(suggestedQty));
        
        suggestionRuleRepository.save(rule);
    }

    private boolean isItemLowStock(Inventory inventory, SuggestionRule rule) {
        BigDecimal currentStock = BigDecimal.valueOf(inventory.getTotalQuantity() != null ? inventory.getTotalQuantity() : 0);
        BigDecimal threshold = rule.getReorderThreshold() != null ? rule.getReorderThreshold() : BigDecimal.valueOf(5);
        
        return currentStock.compareTo(threshold) <= 0;
    }

    private SuggestionRule createDefaultRule(Inventory inventory) {
        return SuggestionRule.builder()
            .canonicalName(inventory.getName())
            .reorderThreshold(BigDecimal.valueOf(5))
            .suggestedQuantity(BigDecimal.valueOf(10))
            .isActive(true)
            .build();
    }

    private ShoppingListItemResponseDTO createRuleSuggestion(Inventory inventory, SuggestionRule rule) {
        ShoppingListItemResponseDTO suggestion = new ShoppingListItemResponseDTO();
        suggestion.setCanonicalName(inventory.getName());
        suggestion.setSuggestedQuantity(rule.getSuggestedQuantity());
        suggestion.setUnitName(inventory.getUnit() != null ? inventory.getUnit().getName() : "units");
        suggestion.setSuggestedBy("RULE");
        suggestion.setSuggestionReason("Low stock: " + inventory.getTotalQuantity() + " remaining");
        suggestion.setConfidenceScore(BigDecimal.valueOf(0.8));
        suggestion.setStatus("PENDING");
        return suggestion;
    }
}
