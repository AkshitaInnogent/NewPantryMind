package com.innogent.pantry_mind.service;

import com.innogent.pantry_mind.dto.request.ConfirmItemsRequestDto;
import com.innogent.pantry_mind.entity.*;
import com.innogent.pantry_mind.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PantryService {
    
    private final OcrUploadRepository ocrUploadRepository;
    private final AiExtractedItemsRepository aiExtractedItemsRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final CategoryRepository categoryRepository;
    private final UnitRepository unitRepository;
    
    @Transactional
    public List<InventoryItem> confirmAndSaveItems(ConfirmItemsRequestDto request) {
        // Update OCR upload status
        OcrUpload ocrUpload = ocrUploadRepository.findById(request.getOcrUploadId())
            .orElseThrow(() -> new RuntimeException("OCR upload not found"));
        
        ocrUpload.setStatus(OcrUpload.ProcessingStatus.CONFIRMED);
        ocrUploadRepository.save(ocrUpload);
        
        // Mark AI extracted items as confirmed
        List<AiExtractedItems> aiItems = aiExtractedItemsRepository.findByOcrUploadId(request.getOcrUploadId());
        aiItems.forEach(item -> item.setIsConfirmed(true));
        aiExtractedItemsRepository.saveAll(aiItems);
        
        // Create inventory items
        List<InventoryItem> inventoryItems = request.getItems().stream()
            .map(itemDto -> {
                InventoryItem item = new InventoryItem();
                item.setName(itemDto.getRawName());
                item.setDescription(itemDto.getCanonicalName());
                item.setKitchenId(ocrUpload.getKitchenId());  // Changed from setKitchen_id
                item.setCreatedBy(ocrUpload.getUploadedBy()); // Changed from setCreated_by
                
                // Find or create category
                Category category = findOrCreateCategory(itemDto.getCategoryName());
                item.setCategory(category);
                
                // Find or create unit
                Unit unit = findOrCreateUnit(itemDto.getUnitName());
                item.setUnit(unit);
                
                item.setQuantity(itemDto.getQuantity() != null ? itemDto.getQuantity().longValue() : 1L);
                item.setLocation(itemDto.getStorageType());
                
                if (itemDto.getExpiryDate() != null) {
                    try {
                        LocalDate expiryDate = LocalDate.parse(itemDto.getExpiryDate(), DateTimeFormatter.ISO_LOCAL_DATE);
                        item.setExpiryDate(java.sql.Date.valueOf(expiryDate));
                    } catch (Exception e) {
                        // Handle date parsing error
                    }
                }
                
                return item;
            })
            .toList();
        
        return inventoryItemRepository.saveAll(inventoryItems);
    }
    
    private Category findOrCreateCategory(String categoryName) {
        final String finalCategoryName = (categoryName == null || categoryName.isEmpty()) ? "Other" : categoryName;
        
        return categoryRepository.findByName(finalCategoryName)
            .orElseGet(() -> {
                Category category = new Category();
                category.setName(finalCategoryName);
                category.setDescription("Auto-created from OCR");
                return categoryRepository.save(category);
            });
    }
    
    private Unit findOrCreateUnit(String unitName) {
        final String finalUnitName = (unitName == null || unitName.isEmpty()) ? "piece" : unitName;
        
        return unitRepository.findByName(finalUnitName)
            .orElseGet(() -> {
                Unit unit = new Unit();
                unit.setName(finalUnitName);
                unit.setType("weight"); // Default type
                return unitRepository.save(unit);
            });
    }
}
