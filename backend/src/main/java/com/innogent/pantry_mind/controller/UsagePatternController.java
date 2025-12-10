package com.innogent.pantry_mind.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.innogent.pantry_mind.dto.response.ShoppingSuggestionDTO;
import com.innogent.pantry_mind.service.UsagePatternService;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usage-patterns")
@RequiredArgsConstructor
public class UsagePatternController {

    private final UsagePatternService usagePatternService;

    @PostMapping("/daily-patterns")
    public ResponseEntity<List<ShoppingSuggestionDTO>> getDailyPatterns(@RequestBody Map<String, Object> request) {
        Object kitchenIdObj = request.get("kitchenId");
        if (kitchenIdObj == null) {
            throw new IllegalArgumentException("kitchenId is required");
        }
        Long kitchenId = Long.valueOf(kitchenIdObj.toString());
        
        Object existingItemsObj = request.get("existingItems");
        @SuppressWarnings("unchecked")
        List<String> existingItems = existingItemsObj != null ? (List<String>) existingItemsObj : List.of();
        
        List<ShoppingSuggestionDTO> suggestions = usagePatternService.getDailyPatternSuggestions(kitchenId, existingItems);
        return ResponseEntity.ok(suggestions);
    }

    @PostMapping("/weekly-patterns")
    public ResponseEntity<List<ShoppingSuggestionDTO>> getWeeklyPatterns(@RequestBody Map<String, Object> request) {
        Object kitchenIdObj = request.get("kitchenId");
        if (kitchenIdObj == null) {
            throw new IllegalArgumentException("kitchenId is required");
        }
        Long kitchenId = Long.valueOf(kitchenIdObj.toString());
        
        Object existingItemsObj = request.get("existingItems");
        @SuppressWarnings("unchecked")
        List<String> existingItems = existingItemsObj != null ? (List<String>) existingItemsObj : List.of();
        
        List<ShoppingSuggestionDTO> suggestions = usagePatternService.getWeeklyPatternSuggestions(kitchenId, existingItems);
        return ResponseEntity.ok(suggestions);
    }

    @PostMapping("/monthly-patterns")
    public ResponseEntity<List<ShoppingSuggestionDTO>> getMonthlyPatterns(@RequestBody Map<String, Object> request) {
        Object kitchenIdObj = request.get("kitchenId");
        if (kitchenIdObj == null) {
            throw new IllegalArgumentException("kitchenId is required");
        }
        Long kitchenId = Long.valueOf(kitchenIdObj.toString());
        
        Object existingItemsObj = request.get("existingItems");
        @SuppressWarnings("unchecked")
        List<String> existingItems = existingItemsObj != null ? (List<String>) existingItemsObj : List.of();
        
        List<ShoppingSuggestionDTO> suggestions = usagePatternService.getMonthlyPatternSuggestions(kitchenId, existingItems);
        return ResponseEntity.ok(suggestions);
    }

    @PostMapping("/record-consumption")
    public ResponseEntity<Map<String, String>> recordConsumption(@RequestBody Map<String, Object> request) {
        Object kitchenIdObj = request.get("kitchenId");
        Object itemNameObj = request.get("itemName");
        Object quantityObj = request.get("quantity");
        Object userIdObj = request.get("userId");
        
        if (kitchenIdObj == null || itemNameObj == null || quantityObj == null || userIdObj == null) {
            throw new IllegalArgumentException("kitchenId, itemName, quantity, and userId are required");
        }
        
        Long kitchenId = Long.valueOf(kitchenIdObj.toString());
        String itemName = itemNameObj.toString();
        Double quantity = Double.valueOf(quantityObj.toString());
        Long unitId = request.get("unitId") != null ? Long.valueOf(request.get("unitId").toString()) : null;
        Long userId = Long.valueOf(userIdObj.toString());
        
        usagePatternService.recordConsumption(kitchenId, itemName, quantity, unitId, userId);
        return ResponseEntity.ok(Map.of("status", "success"));
    }
}
