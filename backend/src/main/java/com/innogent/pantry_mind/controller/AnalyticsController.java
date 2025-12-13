package com.innogent.pantry_mind.controller;

import com.innogent.pantry_mind.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@CrossOrigin
public class AnalyticsController {
    
    private final AnalyticsService analyticsService;
    
    @GetMapping("/usage/{kitchenId}")
    public ResponseEntity<Map<String, Object>> getUsageAnalytics(@PathVariable Long kitchenId) {
        return ResponseEntity.ok(analyticsService.getUsageAnalytics(kitchenId));
    }
    
    @GetMapping("/meals/{kitchenId}")
    public ResponseEntity<Map<String, Object>> getMealAnalytics(@PathVariable Long kitchenId) {
        return ResponseEntity.ok(analyticsService.getMealAnalytics(kitchenId));
    }
    
    @GetMapping("/waste/{kitchenId}")
    public ResponseEntity<Map<String, Object>> getWasteAnalytics(@PathVariable Long kitchenId) {
        return ResponseEntity.ok(analyticsService.getWasteAnalytics(kitchenId));
    }
    
    @GetMapping("/purchases/{kitchenId}")
    public ResponseEntity<Map<String, Object>> getPurchaseAnalytics(@PathVariable Long kitchenId) {
        return ResponseEntity.ok(analyticsService.getPurchaseAnalytics(kitchenId));
    }
    
    @GetMapping("/expiry/{kitchenId}")
    public ResponseEntity<Map<String, Object>> getExpiryAnalytics(@PathVariable Long kitchenId) {
        return ResponseEntity.ok(analyticsService.getExpiryAnalytics(kitchenId));
    }
    
    @GetMapping("/categories/{kitchenId}")
    public ResponseEntity<Map<String, Object>> getCategoryAnalytics(@PathVariable Long kitchenId) {
        return ResponseEntity.ok(analyticsService.getCategoryAnalytics(kitchenId));
    }
    
    @GetMapping("/summary/{kitchenId}")
    public ResponseEntity<Map<String, Object>> getSummaryAnalytics(@PathVariable Long kitchenId) {
        return ResponseEntity.ok(analyticsService.getSummaryAnalytics(kitchenId));
    }
}