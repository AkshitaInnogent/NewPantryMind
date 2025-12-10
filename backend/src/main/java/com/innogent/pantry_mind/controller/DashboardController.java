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
}