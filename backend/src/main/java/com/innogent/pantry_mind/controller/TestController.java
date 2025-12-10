package com.innogent.pantry_mind.controller;

import com.innogent.pantry_mind.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
@CrossOrigin
@RequiredArgsConstructor
public class TestController {
    
    private final NotificationService notificationService;
    
    @PostMapping("/notification")
    public ResponseEntity<String> testNotification(@RequestParam Long kitchenId) {
        // Send test notifications
        notificationService.sendInventoryAlert(kitchenId, "LOW_STOCK", "Test: 3 items are running low on stock", null);
        notificationService.sendInventoryAlert(kitchenId, "EXPIRY_WARNING", "Test: 2 items expiring in 2 days", null);
        notificationService.sendInventoryAlert(kitchenId, "EXPIRY_CRITICAL", "Test: 1 item expiring today", null);
        
        return ResponseEntity.ok("Test notifications sent to kitchen " + kitchenId);
    }
}