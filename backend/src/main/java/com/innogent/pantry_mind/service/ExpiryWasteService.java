package com.innogent.pantry_mind.service;

import com.innogent.pantry_mind.entity.*;
import com.innogent.pantry_mind.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExpiryWasteService {
    
    private final InventoryItemRepository inventoryItemRepository;
    private final WasteLogRepository wasteLogRepository;
    private final NotificationService notificationService;
    
    @Scheduled(cron = "0 10 1 * * ?") // Run daily at 1:10 AM
    @Transactional
    public void processExpiredItems() {
        System.out.println("\n\n=== SCHEDULED TASK RUNNING ===");
        System.out.println("Time: " + new Date());
        System.out.println("Looking for expired items...");
        log.info("Expired items task running at: {}", new Date());
        
        // Find items expiring today or before (compare dates only, not time)
        java.time.LocalDate today = java.time.LocalDate.now();
        List<InventoryItem> expiredItems = inventoryItemRepository.findAll().stream()
            .filter(item -> item.getIsActive() != null && item.getIsActive() && 
                           item.getExpiryDate() != null)
            .filter(item -> {
                java.time.LocalDate itemExpiryDate = item.getExpiryDate().toInstant()
                    .atZone(java.time.ZoneId.systemDefault()).toLocalDate();
                return itemExpiryDate.equals(today) || itemExpiryDate.isBefore(today);
            })
            .toList();
        
        System.out.println("\n*** FOUND " + expiredItems.size() + " EXPIRED ITEMS ***");
        for (InventoryItem item : expiredItems) {
            System.out.println("-> EXPIRED: " + item.getInventory().getName() + " (ID=" + item.getId() + "), Expiry=" + item.getExpiryDate() + ", Qty=" + item.getCurrentQuantity());
        }
        
        // Debug: Show near expiry items (next 3 days)
        java.time.LocalDate threeDaysFromNow = today.plusDays(3);
        List<InventoryItem> nearExpiryItems = inventoryItemRepository.findAll().stream()
            .filter(item -> item.getIsActive() != null && item.getIsActive() && 
                           item.getExpiryDate() != null)
            .filter(item -> {
                java.time.LocalDate itemExpiryDate = item.getExpiryDate().toInstant()
                    .atZone(java.time.ZoneId.systemDefault()).toLocalDate();
                return itemExpiryDate.isAfter(today) && itemExpiryDate.isBefore(threeDaysFromNow.plusDays(1));
            })
            .toList();
        
        System.out.println("\n*** NEAR EXPIRY (Next 3 days): " + nearExpiryItems.size() + " items ***");
        for (InventoryItem item : nearExpiryItems) {
            System.out.println("-> NEAR EXPIRY: " + item.getInventory().getName() + " (ID=" + item.getId() + "), Expiry=" + item.getExpiryDate() + ", Qty=" + item.getCurrentQuantity());
        }
        System.out.println("");
        
        for (InventoryItem item : expiredItems) {
            try {
                // Create waste log entry
                WasteLog wasteLog = WasteLog.builder()
                    .inventoryItemId(item.getId())
                    .kitchenId(item.getInventory().getKitchenId())
                    .itemName(item.getInventory().getName())
                    .quantityWasted(item.getCurrentQuantity())
                    .unit(item.getInventory().getUnit())
                    .wasteReason(WasteLog.WasteReason.EXPIRED)
                    .estimatedValue(calculateItemValue(item))
                    .notes("Automatically logged - item expired on " + item.getExpiryDate())
                    .reportedBy(1L) // System user ID
                    .build();
                
                wasteLogRepository.save(wasteLog);
                System.out.println("✓ MOVED TO WASTE: " + item.getInventory().getName() + " (ID=" + item.getId() + ") - Qty: " + item.getCurrentQuantity() + " - Value: ₹" + calculateItemValue(item));
                
                // Store wasted quantity before reducing
                BigDecimal wastedQty = item.getCurrentQuantity();
                
                // Update parent inventory total quantity
                Inventory inventory = item.getInventory();
                long newTotal = Math.max(0, inventory.getTotalQuantity() - wastedQty.longValue());
                inventory.setTotalQuantity(newTotal);
                
                // Reduce quantity to zero and mark as wasted
                item.setCurrentQuantity(BigDecimal.ZERO);
                item.setStatus(InventoryItem.ItemStatus.WASTED);
                item.setIsActive(false);
                inventoryItemRepository.save(item);
                
                // Send notification for expired item moved to waste
                String message = String.format("%s is expired!", item.getInventory().getName());
                notificationService.sendInventoryAlert(item.getInventory().getKitchenId(), "ITEM_EXPIRED_WASTED", message, item.getId());
                
                log.info("Moved expired item {} to waste: {} {}", item.getId(), wastedQty, item.getInventory().getUnit().getName());
                
            } catch (Exception e) {
                log.error("Failed to process expired item ID: {}", item.getId(), e);
            }
        }
        
        if (expiredItems.size() > 0) {
            System.out.println("\n*** COMPLETED: Processed " + expiredItems.size() + " expired items ***\n");
            log.info("Processed {} expired items at {}", expiredItems.size(), new Date());
        } else {
            System.out.println("*** NO EXPIRED ITEMS TO PROCESS ***\n");
        }
    }
    
    private BigDecimal calculateItemValue(InventoryItem item) {
        if (item.getPrice() != null && item.getCurrentQuantity() != null) {
            return item.getPrice().multiply(item.getCurrentQuantity())
                .divide(item.getOriginalQuantity(), 2, BigDecimal.ROUND_HALF_UP);
        }
        return BigDecimal.ZERO;
    }
}