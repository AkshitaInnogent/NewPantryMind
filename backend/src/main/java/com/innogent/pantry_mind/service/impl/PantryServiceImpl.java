package com.innogent.pantry_mind.service.impl;

import com.innogent.pantry_mind.dto.request.ConfirmItemsRequestDto;
import com.innogent.pantry_mind.entity.*;
import com.innogent.pantry_mind.repository.*;
import com.innogent.pantry_mind.service.PantryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PantryServiceImpl implements PantryService {
    
    private final OcrUploadRepository ocrUploadRepository;
    private final AiExtractedItemsRepository aiExtractedItemsRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final CategoryRepository categoryRepository;
    private final UnitRepository unitRepository;
    private final LocationRepository locationRepository;
    
    @Override
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
        
        // Create inventory items using new structure
        List<InventoryItem> inventoryItems = request.getItems().stream()
            .map(itemDto -> {
                // Find or create inventory group
                Category category = findOrCreateCategory(itemDto.getCategoryName());
                Unit unit = findOrCreateUnit(itemDto.getUnitName());
                
                Inventory inventory = findOrCreateInventory(
                    itemDto.getRawName(), 
                    category.getId(), 
                    unit.getId(), 
                    ocrUpload.getKitchenId()
                );
                
                // Create inventory item
                InventoryItem item = new InventoryItem();
                item.setInventory(inventory);
                item.setDescription(itemDto.getCanonicalName());
                item.setCreatedBy(ocrUpload.getUploadedBy());
                item.setQuantity(itemDto.getQuantity() != null ? itemDto.getQuantity().longValue() : 1L);
                Location location = findOrCreateLocation(itemDto.getStorageType());
                item.setLocation(location);
                
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
    
    private Inventory findOrCreateInventory(String name, Long categoryId, Long unitId, Long kitchenId) {
        String normalizedName = com.innogent.pantry_mind.util.NameNormalizationUtil.normalizeName(name);
        
        return inventoryRepository.findByNormalizedNameAndCategoryIdAndUnitIdAndKitchenId(normalizedName, categoryId, unitId, kitchenId)
            .orElseGet(() -> {
                Inventory inventory = new Inventory();
                inventory.setName(name);
                inventory.setNormalizedName(normalizedName);
                inventory.setKitchenId(kitchenId);
                inventory.setCategory(categoryRepository.findById(categoryId).orElse(null));
                inventory.setUnit(unitRepository.findById(unitId).orElse(null));
                inventory.setTotalQuantity(0L);
                return inventoryRepository.save(inventory);
            });
    }
    
    private Location findOrCreateLocation(String locationName) {
        final String finalLocationName = (locationName == null || locationName.isEmpty()) ? "Pantry" : locationName;
        
        return locationRepository.findByName(finalLocationName)
            .orElseGet(() -> {
                Location location = new Location();
                location.setName(finalLocationName);
                return locationRepository.save(location);
            });
    }
}