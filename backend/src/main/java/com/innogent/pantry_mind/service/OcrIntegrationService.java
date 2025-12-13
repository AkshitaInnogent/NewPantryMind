package com.innogent.pantry_mind.service;

import com.innogent.pantry_mind.entity.*;
import com.innogent.pantry_mind.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OcrIntegrationService {
    
    private final AiExtractedItemsRepository aiExtractedItemsRepository;
    private final OcrUploadRepository ocrUploadRepository;
    private final InventoryTrackingService trackingService;
    private final InventoryService inventoryService;
    private final UnitRepository unitRepository;
    
    @Transactional
    public void confirmOcrItems(Long ocrUploadId, List<Long> confirmedItemIds, Long userId) {
        List<AiExtractedItems> extractedItems = aiExtractedItemsRepository
            .findByOcrUploadId(ocrUploadId);
        
        for (AiExtractedItems aiItem : extractedItems) {
            if (confirmedItemIds.contains(aiItem.getId())) {
                processConfirmedItem(aiItem, userId);
            }
        }
        
        log.info("Processed {} confirmed items from OCR upload {}", 
                confirmedItemIds.size(), ocrUploadId);
    }
    
    private void processConfirmedItem(AiExtractedItems aiItem, Long userId) {
        try {
            // 1. Log the purchase
            Unit unit = findOrCreateUnit(aiItem.getUnitName());
            
            PurchaseLog purchaseLog = trackingService.logPurchase(
                getKitchenIdFromOcr(aiItem.getOcrUploadId()),
                userId,
                aiItem.getCanonicalName(),
                aiItem.getBrand(),
                BigDecimal.valueOf(aiItem.getQuantity()),
                unit,
                BigDecimal.valueOf(aiItem.getPrice()),
                null, // Store name not available from OCR
                PurchaseLog.PurchaseSource.GROCERY_STORE,
                "OCR_" + aiItem.getOcrUploadId(),
                aiItem.getExpiryDate()
            );
            
            // 2. Add to inventory using existing service
            InventoryItem inventoryItem = inventoryService.addItemFromOcr(aiItem, userId);
            
            // 3. Link purchase log to inventory item
            purchaseLog.setInventoryItemId(inventoryItem.getId());
            
            // 4. Mark AI item as confirmed
            aiItem.setIsConfirmed(true);
            aiExtractedItemsRepository.save(aiItem);
            
            log.info("Successfully processed OCR item: {} -> Inventory Item: {}", 
                    aiItem.getCanonicalName(), inventoryItem.getId());
            
        } catch (Exception e) {
            log.error("Failed to process OCR item: {}", aiItem.getCanonicalName(), e);
            throw new RuntimeException("Failed to process OCR item: " + e.getMessage());
        }
    }
    
    private Unit findOrCreateUnit(String unitName) {
        if (unitName == null || unitName.trim().isEmpty()) {
            return unitRepository.findByName("pieces")
                .orElse(createDefaultUnit());
        }
        
        return unitRepository.findByName(unitName.toLowerCase())
            .orElseGet(() -> {
                Unit newUnit = new Unit();
                newUnit.setName(unitName.toLowerCase());
                newUnit.setType("weight"); // Default type
                return unitRepository.save(newUnit);
            });
    }
    
    private Unit createDefaultUnit() {
        Unit defaultUnit = new Unit();
        defaultUnit.setName("pieces");
        defaultUnit.setType("count");
        return unitRepository.save(defaultUnit);
    }
    
    private Long getKitchenIdFromOcr(Long ocrUploadId) {
        return ocrUploadRepository.findById(ocrUploadId)
            .map(OcrUpload::getKitchenId)
            .orElseThrow(() -> new RuntimeException("OCR upload not found: " + ocrUploadId));
    }
}