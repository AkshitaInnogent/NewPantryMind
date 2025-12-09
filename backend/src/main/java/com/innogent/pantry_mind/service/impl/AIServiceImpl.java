package com.innogent.pantry_mind.service.impl;

import com.innogent.pantry_mind.dto.response.ShoppingListItemResponseDTO;
import com.innogent.pantry_mind.dto.response.RecipeResponseDTO;
import com.innogent.pantry_mind.entity.Inventory;
import com.innogent.pantry_mind.repository.InventoryRepository;
import com.innogent.pantry_mind.service.AIService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIServiceImpl implements AIService {

    private final InventoryRepository inventoryRepository;
    private final RestTemplate restTemplate;
    
    @Value("${python.backend.url:http://localhost:8001}")
    private String pythonBackendUrl;

    @Override
    public boolean isAIAvailable() {
        try {
            String response = restTemplate.getForObject(pythonBackendUrl + "/health", String.class);
            return response != null && response.contains("healthy");
        } catch (Exception e) {
            log.warn("AI Service unavailable: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public List<ShoppingListItemResponseDTO> generateAISuggestions(Long kitchenId) {
        try {
            Map<String, Object> aiRequest = new HashMap<>();
            aiRequest.put("kitchenId", kitchenId);
            aiRequest.put("listType", "RANDOM");
            aiRequest.put("existingItems", Collections.emptyList());
            
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(
                pythonBackendUrl + "/api/ai-shopping/suggestions", 
                aiRequest, 
                Map.class
            );
            
            if (response != null && response.get("suggestions") != null) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> suggestions = (List<Map<String, Object>>) response.get("suggestions");
                return suggestions.stream()
                    .map(this::convertMapToShoppingItem)
                    .collect(Collectors.toList());
            }
        } catch (Exception e) {
            log.error("AI suggestion generation failed: {}", e.getMessage());
        }
        
        return generateRuleBasedSuggestions(kitchenId);
    }

    @Override
    public Map<String, Object> analyzeConsumptionPatterns(Long kitchenId) {
        return generateBasicAnalysis(kitchenId);
    }

    @Override
    public List<String> generateSmartRecipeRecommendations(Long kitchenId, Integer servings) {
        return Arrays.asList("Basic Rice", "Simple Soup", "Mixed Vegetables", "Dal Tadka");
    }

    @Override
    public RecipeResponseDTO generateSeasonalRecipes(Long kitchenId, String season, Integer servings) {
        return createFallbackSeasonalRecipes(season, servings);
    }

    @Override
    public RecipeResponseDTO generateLowStockRecipes(Long kitchenId, Integer servings) {
        return createFallbackLowStockRecipes(kitchenId, servings);
    }

    private ShoppingListItemResponseDTO convertMapToShoppingItem(Map<String, Object> suggestion) {
        ShoppingListItemResponseDTO item = new ShoppingListItemResponseDTO();
        
        String name = suggestion.get("name") != null ? suggestion.get("name").toString() : "Unknown Item";
        Object quantityObj = suggestion.get("quantity");
        double quantity = quantityObj instanceof Number ? ((Number) quantityObj).doubleValue() : 1.0;
        String reason = suggestion.get("reason") != null ? suggestion.get("reason").toString() : "AI Suggestion";
        
        item.setCanonicalName(name);
        item.setSuggestedQuantity(BigDecimal.valueOf(quantity));
        item.setSuggestedBy("AI");
        item.setSuggestionReason(reason);
        item.setConfidenceScore(BigDecimal.valueOf(0.8));
        
        return item;
    }

    private List<ShoppingListItemResponseDTO> generateRuleBasedSuggestions(Long kitchenId) {
        List<Inventory> lowStockItems = inventoryRepository.findLowStockByKitchenId(kitchenId);
        return lowStockItems.stream().map(item -> {
            ShoppingListItemResponseDTO suggestion = new ShoppingListItemResponseDTO();
            suggestion.setCanonicalName(item.getName());
            suggestion.setSuggestedQuantity(BigDecimal.valueOf(calculateSmartQuantity(item)));
            suggestion.setSuggestedBy("RULE");
            suggestion.setSuggestionReason("Low stock: " + item.getTotalQuantity() + " remaining");
            suggestion.setConfidenceScore(BigDecimal.valueOf(0.8));
            return suggestion;
        }).collect(Collectors.toList());
    }

    private Map<String, Object> generateBasicAnalysis(Long kitchenId) {
        Map<String, Object> analysis = new HashMap<>();
        List<Inventory> inventory = inventoryRepository.findByKitchenId(kitchenId);
        List<Inventory> lowStockItems = inventoryRepository.findLowStockByKitchenId(kitchenId);
        
        analysis.put("totalItems", inventory.size());
        analysis.put("lowStockCount", lowStockItems.size());
        analysis.put("analysisType", "BASIC_RULE_BASED");
        analysis.put("efficiency", inventory.size() > 0 ? (double)(inventory.size() - lowStockItems.size()) / inventory.size() : 0.0);
        analysis.put("insights", Arrays.asList(
            "Monitor low stock items regularly",
            "Consider bulk buying for frequently used items",
            "Set up automatic reorder points"
        ));
        
        return analysis;
    }

    private RecipeResponseDTO createFallbackSeasonalRecipes(String season, Integer servings) {
        RecipeResponseDTO response = new RecipeResponseDTO();
        response.setRecipes(new ArrayList<>());
        return response;
    }

    private RecipeResponseDTO createFallbackLowStockRecipes(Long kitchenId, Integer servings) {
        RecipeResponseDTO response = new RecipeResponseDTO();
        response.setRecipes(new ArrayList<>());
        return response;
    }

    private Double calculateSmartQuantity(Inventory item) {
        Long currentStock = item.getTotalQuantity() != null ? item.getTotalQuantity() : 0L;
        if (currentStock == 0) return 10.0;
        if (currentStock <= 2) return 8.0;
        return 5.0;
    }
}
