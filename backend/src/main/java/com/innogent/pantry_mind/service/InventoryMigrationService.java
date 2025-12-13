package com.innogent.pantry_mind.service;

import com.innogent.pantry_mind.entity.InventoryItem;
import com.innogent.pantry_mind.repository.InventoryItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryMigrationService implements CommandLineRunner {
    
    private final InventoryItemRepository inventoryItemRepository;
    
    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Starting inventory migration to new tracking system...");
        
        try {
            migrateExistingItems();
            log.info("Inventory migration completed successfully");
        } catch (Exception e) {
            log.error("Inventory migration failed", e);
        }
    }
    
    private void migrateExistingItems() {
        List<InventoryItem> allItems = inventoryItemRepository.findAll();
        int migrated = 0;
        
        for (InventoryItem item : allItems) {
            boolean needsUpdate = false;
            
            // Migrate quantity fields
            if (item.getCurrentQuantity() == null && item.getQuantity() != null) {
                item.setCurrentQuantity(new BigDecimal(item.getQuantity()));
                needsUpdate = true;
            }
            
            if (item.getOriginalQuantity() == null && item.getQuantity() != null) {
                item.setOriginalQuantity(new BigDecimal(item.getQuantity()));
                needsUpdate = true;
            }
            
            // Set default status
            if (item.getIsActive() == null) {
                item.setIsActive(item.getCurrentQuantity() != null && 
                               item.getCurrentQuantity().compareTo(BigDecimal.ZERO) > 0);
                needsUpdate = true;
            }
            
            if (item.getStatus() == null) {
                if (item.getIsActive() != null && item.getIsActive()) {
                    item.setStatus(InventoryItem.ItemStatus.FRESH);
                } else {
                    item.setStatus(InventoryItem.ItemStatus.CONSUMED);
                }
                needsUpdate = true;
            }
            
            if (needsUpdate) {
                inventoryItemRepository.save(item);
                migrated++;
            }
        }
        
        log.info("Migrated {} inventory items to new tracking system", migrated);
    }
}