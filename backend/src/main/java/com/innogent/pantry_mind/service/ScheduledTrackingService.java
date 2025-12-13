package com.innogent.pantry_mind.service;

import com.innogent.pantry_mind.repository.KitchenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduledTrackingService {
    
    private final InventoryTrackingService trackingService;
    private final KitchenRepository kitchenRepository;
    
    // Disabled - ExpiryWasteService handles expired items processing
    // @Scheduled(cron = "0 9 0 * * *")
    // public void processExpiredItems() { ... }
    
    @Scheduled(cron = "0 0 9 * * MON") // Every Monday at 9 AM
    public void generateWeeklyReports() {
        log.info("Starting weekly tracking reports generation");
        
        try {
            List<Long> kitchenIds = kitchenRepository.findAllKitchenIds();
            
            for (Long kitchenId : kitchenIds) {
                try {
                    generateKitchenWeeklyReport(kitchenId);
                } catch (Exception e) {
                    log.error("Failed to generate weekly report for kitchen: {}", kitchenId, e);
                }
            }
            
            log.info("Completed weekly reports generation");
            
        } catch (Exception e) {
            log.error("Failed to generate weekly reports", e);
        }
    }
    
    private void generateKitchenWeeklyReport(Long kitchenId) {
        // This would generate analytics reports
        // Implementation depends on your reporting requirements
        log.debug("Generated weekly report for kitchen: {}", kitchenId);
    }
}