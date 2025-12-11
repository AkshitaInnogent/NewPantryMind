package com.innogent.pantry_mind.service;

import com.innogent.pantry_mind.entity.*;
import com.innogent.pantry_mind.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExpiryWasteService {
    
    private final InventoryItemRepository inventoryItemRepository;
    private final WasteLogRepository wasteLogRepository;
    
    @Scheduled(cron = "0 0 2 * * ?") // Run daily at 2 AM
    @Transactional
    public void processExpiredItems() {
        log.info("Starting expired items processing...");
        
        LocalDate today = LocalDate.now();
        
        // Find all expired active items - we'll need to iterate through all kitchens
        // For now, this will find expired items for all kitchens
        List<InventoryItem> expiredItems = inventoryItemRepository
            .findAll().stream()
            .filter(item -> item.getIsActive() != null && item.getIsActive() && 
                           item.getExpiryDate() != null && 
                           item.getExpiryDate().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate().isBefore(today))
            .toList();
        
        for (InventoryItem item : expiredItems) {
            try {
                // Create waste log entry
                WasteLog wasteLog = WasteLog.builder()
                    .inventoryItemId(item.getId())
                    .kitchenId(item.getInventory().getKitchenId())
                    .quantityWasted(item.getCurrentQuantity())
                    .unit(item.getInventory().getUnit())
                    .wasteReason(WasteLog.WasteReason.EXPIRED)
                    .estimatedValue(calculateItemValue(item))
                    .notes("Automatically logged - item expired on " + item.getExpiryDate())
                    .reportedBy(null) // System generated
                    .build();
                
                wasteLogRepository.save(wasteLog);
                
                // Mark item as inactive and wasted
                item.setIsActive(false);
                item.setStatus(InventoryItem.ItemStatus.WASTED);
                item.setCurrentQuantity(BigDecimal.ZERO);
                inventoryItemRepository.save(item);
                
                log.info("Logged expired item as waste: {} (ID: {})", 
                    item.getInventory().getName(), item.getId());
                
            } catch (Exception e) {
                log.error("Failed to process expired item ID: {}", item.getId(), e);
            }
        }
        
        log.info("Completed expired items processing. Processed {} items", expiredItems.size());
    }
    
    private BigDecimal calculateItemValue(InventoryItem item) {
        if (item.getPrice() != null && item.getCurrentQuantity() != null) {
            return item.getPrice().multiply(item.getCurrentQuantity())
                .divide(item.getOriginalQuantity(), 2, BigDecimal.ROUND_HALF_UP);
        }
        return BigDecimal.ZERO;
    }
}