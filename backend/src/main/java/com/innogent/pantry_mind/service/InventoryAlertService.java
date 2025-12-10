package com.innogent.pantry_mind.service;

import com.innogent.pantry_mind.repository.InventoryRepository;
import com.innogent.pantry_mind.repository.KitchenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InventoryAlertService {
    
    private final InventoryRepository inventoryRepository;
    private final KitchenRepository kitchenRepository;
    private final NotificationService notificationService;
    
    @Scheduled(cron = "0 */15 * * * *") // Check every 15 minutes
    public void checkInventoryAlerts() {
        java.time.LocalTime now = java.time.LocalTime.now();
        
        kitchenRepository.findAll().forEach(kitchen -> {
            if (kitchen.getAlertsEnabled() && shouldSendAlertsNow(kitchen, now)) {
                checkExpiryAlertsForKitchen(kitchen.getId());
                checkLowStockAlertsForKitchen(kitchen.getId());
            }
        });
    }
    
    private boolean shouldSendAlertsNow(com.innogent.pantry_mind.entity.Kitchen kitchen, java.time.LocalTime now) {
        int alertHour = kitchen.getAlertTimeHour();
        int alertMinute = kitchen.getAlertTimeMinute();
        
        // Check if current time matches alert time (within 15-minute window)
        return now.getHour() == alertHour && 
               now.getMinute() >= alertMinute && 
               now.getMinute() < alertMinute + 15;
    }
    
    private void checkExpiryAlertsForKitchen(Long kitchenId) {
        // Check critical expiry (today)
        Long criticalCount = inventoryRepository.countExpiringItems(); // Items expiring today
        if (criticalCount > 0) {
            notificationService.sendInventoryAlert(kitchenId, "EXPIRY_CRITICAL", 
                criticalCount + " items expiring today", null);
        }
        
        // Check warning expiry (within alert days)
        Long warningCount = inventoryRepository.countExpiringItems(); // Items expiring within alert days
        if (warningCount > criticalCount) {
            notificationService.sendInventoryAlert(kitchenId, "EXPIRY_WARNING", 
                (warningCount - criticalCount) + " items expiring soon", null);
        }
    }
    
    private void checkLowStockAlertsForKitchen(Long kitchenId) {
        Long lowStockCount = inventoryRepository.countLowStockItems();
        
        if (lowStockCount > 0) {
            notificationService.sendInventoryAlert(kitchenId, "LOW_STOCK",
                lowStockCount + " items are running low", null);
        }
    }
}