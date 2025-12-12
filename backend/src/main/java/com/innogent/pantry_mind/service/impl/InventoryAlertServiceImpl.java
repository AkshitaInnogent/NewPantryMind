package com.innogent.pantry_mind.service.impl;

import com.innogent.pantry_mind.entity.Inventory;
import com.innogent.pantry_mind.entity.InventoryItem;
import com.innogent.pantry_mind.repository.InventoryRepository;
import com.innogent.pantry_mind.repository.KitchenRepository;
import com.innogent.pantry_mind.service.InventoryAlertService;
import com.innogent.pantry_mind.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryAlertServiceImpl implements InventoryAlertService {
    
    private final InventoryRepository inventoryRepository;
    private final KitchenRepository kitchenRepository;
    private final NotificationService notificationService;
    
    @Override
    @Scheduled(cron = "0 */15 * * * *") // Check every 15 minutes
    @org.springframework.transaction.annotation.Transactional
    public void checkInventoryAlerts() {
        java.time.LocalTime now = java.time.LocalTime.now();
        System.out.println("🕐 Scheduler running at: " + now);
        
        kitchenRepository.findAll().forEach(kitchen -> {
            System.out.println("Kitchen " + kitchen.getId() + " - Alerts enabled: " + kitchen.getAlertsEnabled() + ", Alert time: " + kitchen.getAlertTimeHour() + ":" + kitchen.getAlertTimeMinute());
            if (kitchen.getAlertsEnabled() && shouldSendAlertsNow(kitchen, now)) {
                System.out.println("🔔 Sending alerts for kitchen " + kitchen.getId());
                checkExpiryAlertsForKitchen(kitchen.getId());
                checkLowStockAlertsForKitchen(kitchen.getId());
            }
        });
    }
    
    private boolean shouldSendAlertsNow(com.innogent.pantry_mind.entity.Kitchen kitchen, java.time.LocalTime now) {
        int alertHour = kitchen.getAlertTimeHour();
        int alertMinute = kitchen.getAlertTimeMinute();
        
        // Check if current time matches alert time exactly
        return now.getHour() == alertHour && now.getMinute() == alertMinute;
    }
    
    private void checkExpiryAlertsForKitchen(Long kitchenId) {
        List<Inventory> inventories = inventoryRepository.findByKitchenId(kitchenId);
        
        long criticalCount = 0;
        long warningCount = 0;
        
        LocalDate today = LocalDate.now();
        
        for (Inventory inventory : inventories) {
            if (inventory.getItems() != null) {
                for (InventoryItem item : inventory.getItems()) {
                    if (item.getExpiryDate() != null) {
                        LocalDate expiryDate = item.getExpiryDate().toInstant()
                            .atZone(ZoneId.systemDefault()).toLocalDate();
                        
                        long daysUntilExpiry = java.time.temporal.ChronoUnit.DAYS.between(today, expiryDate);
                        
                        if (daysUntilExpiry <= 0) {
                            criticalCount++;
                        } else if (daysUntilExpiry <= inventory.getMinExpiryDaysAlert()) {
                            warningCount++;
                        }
                    }
                }
            }
        }
        
        if (criticalCount > 0) {
            notificationService.sendInventoryAlert(kitchenId, "ITEMS_EXPIRED", 
                criticalCount + " items have expired", null);
        }
        
        if (warningCount > 0) {
            notificationService.sendInventoryAlert(kitchenId, "EXPIRY_WARNING", 
                warningCount + " items expiring soon", null);
        }
    }
    
    private void checkLowStockAlertsForKitchen(Long kitchenId) {
        List<Inventory> lowStockItems = inventoryRepository.findLowStockItems(kitchenId);
        System.out.println("Low stock items found: " + lowStockItems.size());
        
        if (!lowStockItems.isEmpty()) {
            System.out.println("📦 Sending low stock alert");
            notificationService.sendInventoryAlert(kitchenId, "LOW_STOCK",
                lowStockItems.size() + " items are running low on stock", null);
        }
    }
}