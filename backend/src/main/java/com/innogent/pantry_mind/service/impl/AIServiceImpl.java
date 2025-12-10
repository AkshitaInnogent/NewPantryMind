package com.innogent.pantry_mind.service.impl;

import com.innogent.pantry_mind.dto.response.ShoppingListItemResponseDTO;
import com.innogent.pantry_mind.dto.response.RecipeResponseDTO;
import com.innogent.pantry_mind.entity.ConsumptionEvent;
import com.innogent.pantry_mind.entity.Inventory;
import com.innogent.pantry_mind.repository.ConsumptionEventRepository;
import com.innogent.pantry_mind.repository.InventoryRepository;
import com.innogent.pantry_mind.service.AIService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIServiceImpl implements AIService {

    private final InventoryRepository inventoryRepository;
    private final ConsumptionEventRepository consumptionEventRepository;
    private final RestTemplate restTemplate;
    
    @Value("${python.backend.url:http://localhost:8000}")
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
        return generateAISuggestionsForListType(kitchenId, "DAILY", Collections.emptyList());
    }

    public List<ShoppingListItemResponseDTO> generateAISuggestionsForListType(Long kitchenId, String listType, List<String> existingItems) {
        try {
            // Fetch real consumption data from database
            LocalDateTime analysisStartDate = LocalDateTime.now().minusDays(90); // Last 90 days
            List<ConsumptionEvent> consumptionEvents = consumptionEventRepository
                .findByKitchenIdAndCreatedAtAfter(kitchenId, analysisStartDate);
            
            // Fetch current inventory
            List<Inventory> currentInventory = inventoryRepository.findByKitchenId(kitchenId);
            
            // Prepare AI request with real data
            Map<String, Object> aiRequest = buildAIRequest(kitchenId, listType, existingItems, 
                consumptionEvents, currentInventory, analysisStartDate);
            
            log.info("Sending AI request with {} consumption events and {} inventory items", 
                consumptionEvents.size(), currentInventory.size());
            
            // Call Python AI service
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(
                pythonBackendUrl + "/api/ai-shopping/suggestions", 
                aiRequest, 
                Map.class
            );
            
            if (response != null && response.get("suggestions") != null) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> suggestions = (List<Map<String, Object>>) response.get("suggestions");
                log.info("Received {} AI suggestions", suggestions.size());
                return suggestions.stream()
                    .map(this::convertMapToShoppingItem)
                    .collect(Collectors.toList());
            }
        } catch (Exception e) {
            log.error("AI suggestion generation failed: {}", e.getMessage());
        }
        
        log.info("Falling back to rule-based suggestions");
        return generateRuleBasedSuggestions(kitchenId);
    }

    private Map<String, Object> buildAIRequest(Long kitchenId, String listType, List<String> existingItems,
            List<ConsumptionEvent> consumptionEvents, List<Inventory> currentInventory, LocalDateTime analysisStartDate) {
        
        Map<String, Object> aiRequest = new HashMap<>();
        aiRequest.put("kitchenId", kitchenId);
        aiRequest.put("listType", listType);
        aiRequest.put("existingItems", existingItems);
        
        // Build consumption data
        Map<String, Object> consumptionData = new HashMap<>();
        consumptionData.put("kitchenId", kitchenId);
        consumptionData.put("analysisStartDate", analysisStartDate.toString());
        
        // Convert consumption events to format expected by Python AI
        List<Map<String, Object>> consumptionEventMaps = consumptionEvents.stream()
            .map(this::convertConsumptionEventToMap)
            .collect(Collectors.toList());
        consumptionData.put("consumptionEvents", consumptionEventMaps);
        
        // Convert inventory to format expected by Python AI
        List<Map<String, Object>> inventoryMaps = currentInventory.stream()
            .map(this::convertInventoryToMap)
            .collect(Collectors.toList());
        consumptionData.put("currentInventory", inventoryMaps);
        
        aiRequest.put("consumptionData", consumptionData);
        
        return aiRequest;
    }

    private Map<String, Object> convertConsumptionEventToMap(ConsumptionEvent event) {
        Map<String, Object> eventMap = new HashMap<>();
        eventMap.put("itemName", event.getCanonicalName());
        eventMap.put("quantity", event.getQuantityConsumed());
        eventMap.put("consumedAt", event.getCreatedAt().toString());
        eventMap.put("reason", event.getReason().toString());
        if (event.getUnit() != null) {
            eventMap.put("unit", event.getUnit().getName());
        }
        return eventMap;
    }

    private Map<String, Object> convertInventoryToMap(Inventory inventory) {
        Map<String, Object> inventoryMap = new HashMap<>();
        inventoryMap.put("itemName", inventory.getName());
        inventoryMap.put("currentQuantity", inventory.getTotalQuantity());
        inventoryMap.put("minStock", inventory.getMinStock() != null ? inventory.getMinStock() : 5);
        if (inventory.getUnit() != null) {
            inventoryMap.put("unit", inventory.getUnit().getName());
        }
        return inventoryMap;
    }

    @Override
    public Map<String, Object> analyzeConsumptionPatterns(Long kitchenId) {
        try {
            LocalDateTime analysisStartDate = LocalDateTime.now().minusDays(30);
            List<ConsumptionEvent> consumptionEvents = consumptionEventRepository
                .findByKitchenIdAndCreatedAtAfter(kitchenId, analysisStartDate);
            
            if (consumptionEvents.isEmpty()) {
                return generateBasicAnalysis(kitchenId);
            }
            
            // Build AI analysis request
            Map<String, Object> analysisRequest = new HashMap<>();
            analysisRequest.put("kitchenId", kitchenId);
            analysisRequest.put("analysisStartDate", analysisStartDate.toString());
            
            List<Map<String, Object>> eventMaps = consumptionEvents.stream()
                .map(this::convertConsumptionEventToMap)
                .collect(Collectors.toList());
            analysisRequest.put("consumptionEvents", eventMaps);
            
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(
                pythonBackendUrl + "/api/ai-shopping/analyze-consumption", 
                analysisRequest, 
                Map.class
            );
            
            if (response != null) {
                return response;
            }
        } catch (Exception e) {
            log.error("AI consumption analysis failed: {}", e.getMessage());
        }
        
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
        String unit = suggestion.get("unit") != null ? suggestion.get("unit").toString() : "pieces";
        
        item.setCanonicalName(name);
        item.setSuggestedQuantity(BigDecimal.valueOf(quantity));
        item.setUnitName(unit);
        item.setSuggestedBy("AI");
        item.setSuggestionReason(reason);
        item.setConfidenceScore(BigDecimal.valueOf(0.85));
        
        return item;
    }

    private List<ShoppingListItemResponseDTO> generateRuleBasedSuggestions(Long kitchenId) {
        List<Inventory> lowStockItems = inventoryRepository.findLowStockByKitchenId(kitchenId);
        return lowStockItems.stream().map(item -> {
            ShoppingListItemResponseDTO suggestion = new ShoppingListItemResponseDTO();
            suggestion.setCanonicalName(item.getName());
            suggestion.setSuggestedQuantity(BigDecimal.valueOf(calculateSmartQuantity(item)));
            suggestion.setUnitName(item.getUnit() != null ? item.getUnit().getName() : "pieces");
            suggestion.setSuggestedBy("RULE");
            suggestion.setSuggestionReason("Low stock: " + item.getTotalQuantity() + " remaining");
            suggestion.setConfidenceScore(BigDecimal.valueOf(0.6));
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
