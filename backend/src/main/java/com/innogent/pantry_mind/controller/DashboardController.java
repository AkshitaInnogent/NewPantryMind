package com.innogent.pantry_mind.controller;

import com.innogent.pantry_mind.entity.Kitchen;
import com.innogent.pantry_mind.repository.KitchenRepository;
import com.innogent.pantry_mind.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;
    
    @Autowired
    private KitchenRepository kitchenRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        
        Map<String, Object> stats = dashboardService.getDashboardStats(email);
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/settings/alerts")
    public ResponseEntity<Map<String, Object>> getAlertSettings(@RequestParam Long kitchenId) {
        Kitchen kitchen = kitchenRepository.findById(kitchenId).orElseThrow();
        
        Map<String, Object> settings = Map.of(
            "alertTimeHour", kitchen.getAlertTimeHour(),
            "alertTimeMinute", kitchen.getAlertTimeMinute(),
            "alertsEnabled", kitchen.getAlertsEnabled()
        );
        
        return ResponseEntity.ok(settings);
    }
    
    @PutMapping("/settings/alerts")
    public ResponseEntity<Void> updateAlertSettings(
            @RequestParam Long kitchenId,
            @RequestBody Map<String, Object> settings) {
        
        Kitchen kitchen = kitchenRepository.findById(kitchenId).orElseThrow();
        
        if (settings.containsKey("alertTimeHour")) {
            kitchen.setAlertTimeHour((Integer) settings.get("alertTimeHour"));
        }
        if (settings.containsKey("alertTimeMinute")) {
            kitchen.setAlertTimeMinute((Integer) settings.get("alertTimeMinute"));
        }
        if (settings.containsKey("alertsEnabled")) {
            kitchen.setAlertsEnabled((Boolean) settings.get("alertsEnabled"));
        }
        
        kitchenRepository.save(kitchen);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/expired-products")
    public ResponseEntity<Map<String, Object>> getExpiredProducts() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        
        Map<String, Object> stats = dashboardService.getDashboardStats(email);
        
        Map<String, Object> expiredData = Map.of(
            "totalProducts", stats.getOrDefault("expiredProductsCount", 0L),
            "totalWastage", stats.getOrDefault("expiredWasteValue", 0.0)
        );
        
        return ResponseEntity.ok(expiredData);
    }
    
    @GetMapping("/debug-waste-logs")
    public ResponseEntity<Map<String, Object>> debugWasteLogs() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        
        Map<String, Object> stats = dashboardService.getDashboardStats(email);
        
        Map<String, Object> debug = Map.of(
            "allStats", stats,
            "expiredProductsCount", stats.getOrDefault("expiredProductsCount", "NOT_FOUND"),
            "expiredWasteValue", stats.getOrDefault("expiredWasteValue", "NOT_FOUND")
        );
        
        return ResponseEntity.ok(debug);
    }
    
    @GetMapping("/financial-summary")
    public ResponseEntity<?> getFinancialSummary() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        
        return ResponseEntity.ok(dashboardService.getFinancialSummary(email));
    }
    
    @GetMapping("/most-used-ingredients")
    public ResponseEntity<?> getMostUsedIngredients() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        
        return ResponseEntity.ok(dashboardService.getMostUsedIngredients(email));
    }
    
    @GetMapping("/category-breakdown")
    public ResponseEntity<?> getCategoryBreakdown() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        
        return ResponseEntity.ok(dashboardService.getCategoryBreakdown(email));
    }
    
    @GetMapping("/money-flow")
    public ResponseEntity<?> getMoneyFlow() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        
        return ResponseEntity.ok(dashboardService.getMoneyFlow(email));
    }
    
    @GetMapping("/expiry-alert-success")
    public ResponseEntity<?> getExpiryAlertSuccess() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        
        return ResponseEntity.ok(dashboardService.getExpiryAlertSuccess(email));
    }
    
    @GetMapping("/waste-streak")
    public ResponseEntity<?> getWasteStreak() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        
        return ResponseEntity.ok(dashboardService.getWasteStreak(email));
    }
    
    @GetMapping("/monthly-progress")
    public ResponseEntity<?> getMonthlyProgress() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        
        return ResponseEntity.ok(dashboardService.getMonthlyProgress(email));
    }
}

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
class ExpiredProductsController {
    
    @Autowired
    private DashboardService dashboardService;
    
    @GetMapping("/expired-products")
    public ResponseEntity<Map<String, Object>> getExpiredProductsData() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        
        System.out.println("=== EXPIRED PRODUCTS ENDPOINT CALLED ===");
        System.out.println("User email: " + email);
        
        Map<String, Object> stats = dashboardService.getDashboardStats(email);
        System.out.println("Dashboard stats: " + stats);
        
        Map<String, Object> result = Map.of(
            "totalProducts", stats.getOrDefault("expiredProductsCount", 0L),
            "totalWastage", stats.getOrDefault("expiredWasteValue", 0.0),
            "items", java.util.Collections.emptyList()
        );
        
        System.out.println("Returning result: " + result);
        return ResponseEntity.ok(result);
    }
}