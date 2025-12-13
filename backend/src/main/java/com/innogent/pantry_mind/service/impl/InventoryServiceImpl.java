package com.innogent.pantry_mind.service.impl;

import com.innogent.pantry_mind.dto.request.ConsumeItemsRequestDTO;
import com.innogent.pantry_mind.dto.request.CreateInventoryItemRequestDTO;
import com.innogent.pantry_mind.dto.request.UpdateInventoryItemRequestDTO;
import com.innogent.pantry_mind.dto.request.UpdateInventoryAlertsRequestDTO;
import com.innogent.pantry_mind.dto.response.InventoryItemResponseDTO;
import com.innogent.pantry_mind.dto.response.InventoryResponseDTO;
import com.innogent.pantry_mind.dto.response.ConsumeItemsResponseDTO;
import com.innogent.pantry_mind.dto.response.InventoryConsumptionInfoDTO;
import com.innogent.pantry_mind.mapper.InventoryItemMapper;
import com.innogent.pantry_mind.mapper.InventoryMapper;
import com.innogent.pantry_mind.entity.*;
import com.innogent.pantry_mind.repository.*;
import com.innogent.pantry_mind.repository.WasteLogRepository;
import com.innogent.pantry_mind.util.NameNormalizationUtil;
import com.innogent.pantry_mind.util.UnitConversionUtil;
import com.innogent.pantry_mind.service.InventoryService;
import com.innogent.pantry_mind.exception.ItemNotFoundException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final CategoryRepository categoryRepository;
    private final UnitRepository unitRepository;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;
    private final KitchenRepository kitchenRepository;
    private final ConsumptionEventRepository consumptionEventRepository;
    private final PurchaseLogRepository purchaseLogRepository;
    private final UsageLogRepository usageLogRepository;
    private final WasteLogRepository wasteLogRepository;
    private final InventoryItemMapper inventoryItemMapper;
    private final InventoryMapper inventoryMapper;

    @Override
    @Transactional
    public InventoryItemResponseDTO addInventoryItem(CreateInventoryItemRequestDTO dto) {
        try {
            // Validate required fields
            if (dto.getName() == null || dto.getName().trim().isEmpty()) {
                throw new IllegalArgumentException("Item name is required");
            }
            if (dto.getCategoryId() == null) {
                throw new IllegalArgumentException("Category is required");
            }
            if (dto.getUnitId() == null) {
                throw new IllegalArgumentException("Unit is required");
            }
            if (dto.getKitchenId() == null) {
                throw new IllegalArgumentException("Kitchen ID is required");
            }
            if (dto.getCreatedBy() == null) {
                throw new IllegalArgumentException("Created by user ID is required");
            }
            if (dto.getQuantity() == null || dto.getQuantity() <= 0) {
                throw new IllegalArgumentException("Valid quantity is required");
            }
            
            // Convert unit and quantity to base units
            Unit inputUnit = unitRepository.findById(dto.getUnitId())
                    .orElseThrow(() -> new ItemNotFoundException("Unit not found: " + dto.getUnitId()));
            
            String baseUnitName = UnitConversionUtil.getBaseUnit(inputUnit.getName());
            Long convertedQuantity = UnitConversionUtil.convertToBaseUnit(dto.getQuantity(), inputUnit.getName());
            
            Unit baseUnit = unitRepository.findByName(baseUnitName)
                    .orElseThrow(() -> new ItemNotFoundException("Base unit not found: " + baseUnitName));
            
            // Find or create inventory group with base unit
            Inventory inventory = findOrCreateInventory(dto.getName(), dto.getCategoryId(), 
                                                       baseUnit.getId(), dto.getKitchenId());
            
            // Create inventory item with new tracking fields
            InventoryItem item = new InventoryItem();
            item.setInventory(inventory);
            item.setDescription(dto.getDescription());
            
            // Set both original and current quantity
            BigDecimal quantityBD = new BigDecimal(convertedQuantity);
            item.setOriginalQuantity(quantityBD);
            item.setCurrentQuantity(quantityBD);
            item.setIsActive(true);
            item.setStatus(InventoryItem.ItemStatus.FRESH);
            
            if (dto.getLocationId() != null) {
                Location location = locationRepository.findById(dto.getLocationId()).orElse(null);
                item.setLocation(location);
            }
            item.setExpiryDate(dto.getExpiryDate());
            item.setPrice(dto.getPrice());
            item.setCreatedBy(dto.getCreatedBy());
            
            InventoryItem saved = inventoryItemRepository.save(item);
            
            // AUTO-CREATE PURCHASE LOG
            createPurchaseLogForInventoryItem(saved, dto);
            
            // Update total quantity and item count
            updateInventoryTotalQuantity(inventory.getId());
            
            return inventoryItemMapper.toResponseDTO(saved);
        } catch (Exception e) {
            log.error("Error adding inventory item: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to add inventory item: " + e.getMessage(), e);
        }
    }
    
    private void createPurchaseLogForInventoryItem(InventoryItem item, CreateInventoryItemRequestDTO dto) {
        try {
            if (item.getId() == null) {
                log.warn("Cannot create purchase log: InventoryItem ID is null");
                return;
            }
            
            LocalDate expiryLocalDate = null;
            if (dto.getExpiryDate() != null) {
                expiryLocalDate = dto.getExpiryDate().toInstant()
                    .atZone(java.time.ZoneId.systemDefault())
                    .toLocalDate();
            }
            
            BigDecimal pricePaid = item.getPrice() != null ? item.getPrice() : BigDecimal.ZERO;
            
            PurchaseLog purchaseLog = PurchaseLog.builder()
                .kitchenId(dto.getKitchenId())
                .purchasedBy(dto.getCreatedBy())
                .itemName(item.getInventory().getName())
                .quantity(item.getOriginalQuantity())
                .unit(item.getInventory().getUnit())
                .pricePaid(pricePaid)
                .purchaseSource(PurchaseLog.PurchaseSource.GROCERY_STORE)
                .receiptReference("MANUAL_" + System.currentTimeMillis())
                .expiryDate(expiryLocalDate)
                .inventoryItemId(item.getId())
                .build();
            purchaseLogRepository.save(purchaseLog);
        } catch (Exception e) {
            log.warn("Failed to create purchase log for item: {}", item.getId(), e);
        }
    }

    @Override
    public List<InventoryResponseDTO> getAllInventoryItems() {
        // Update existing records with correct itemCount (only active items)
        List<Inventory> inventories = inventoryRepository.findAll();
        for (Inventory inventory : inventories) {
            Long activeCount = inventoryItemRepository.countByInventoryIdAndIsActiveTrue(inventory.getId());
            int newItemCount = activeCount != null ? activeCount.intValue() : 0;
            if (inventory.getItemCount() != newItemCount) {
                inventory.setItemCount(newItemCount);
                inventoryRepository.save(inventory);
            }
        }
        
        return inventories.stream()
                .filter(inventory -> {
                    // Only show inventories with active items or positive total quantity
                    Long activeCount = inventoryItemRepository.countByInventoryIdAndIsActiveTrue(inventory.getId());
                    return activeCount != null && activeCount > 0 && inventory.getTotalQuantity() > 0;
                })
                .map(inventory -> {
                    InventoryResponseDTO dto = inventoryMapper.toResponseDTO(inventory);
                    dto.setEarliestExpiry(inventoryItemRepository.findEarliestExpiryByInventoryId(inventory.getId()));
                    return dto;
                })
                .toList();
    }


    
    @Override
    @Transactional
    public InventoryResponseDTO updateInventoryAlerts(Long inventoryId, UpdateInventoryAlertsRequestDTO dto) {
        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new ItemNotFoundException(inventoryId));
        
        if (dto.getMinExpiryDaysAlert() != null) {
            inventory.setMinExpiryDaysAlert(dto.getMinExpiryDaysAlert());
        }
        if (dto.getMinStock() != null) {
            inventory.setMinStock(dto.getMinStock());
        }
        
        Inventory saved = inventoryRepository.save(inventory);
        return inventoryMapper.toResponseDTO(saved);
    }
    


    // KEEPING THIS VERSION - Better implementation with improved user handling
    @Override
    public InventoryResponseDTO getInventoryItemById(Long id) {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new ItemNotFoundException(id));
        
        InventoryResponseDTO response = inventoryMapper.toResponseDTO(inventory);
        
        // Manually set user names for items
        if (response.getItems() != null) {
            response.getItems().forEach(item -> {
                if (item.getCreatedBy() != null) {
                    userRepository.findById(item.getCreatedBy())
                        .ifPresent(user -> item.setCreatedByName(user.getName()));
                }
            });
        }
        
        // Set item count to only active items and earliest expiry
        int activeItemCount = 0;
        if (response.getItems() != null) {
            activeItemCount = (int) response.getItems().stream()
                .filter(item -> item.getQuantity() != null && item.getQuantity() > 0)
                .count();
        }
        response.setItemCount(activeItemCount);
        response.setEarliestExpiry(inventoryItemRepository.findEarliestExpiryByInventoryId(id));
        
        return response;
    }

    // KEEPING THIS VERSION - Better implementation with consumption event recording
    @Override
    @Transactional
    public void deleteInventoryItem(Long id) {
        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ItemNotFoundException(id));
        
        // Record consumption event
        recordConsumptionEvent(item, ConsumptionEvent.EventReason.CONSUMED);
        
        Inventory inventory = item.getInventory();
        inventoryItemRepository.deleteById(id);
        
        // Update item count
        inventory.setItemCount(inventory.getItemCount() - 1);
        
        // Update total quantity or delete inventory if no items left
        if (inventory.getItemCount() <= 0) {
            inventoryRepository.deleteById(inventory.getId());
        } else {
            updateInventoryTotalQuantity(inventory.getId());
            inventoryRepository.save(inventory);
        }
    }

    public List<InventoryResponseDTO> getInventoryItemsByKitchen(Long kitchenId) {
        // Fix totalQuantity for all inventories first
        List<Inventory> allInventories = inventoryRepository.findByKitchenId(kitchenId);
        for (Inventory inv : allInventories) {
            updateInventoryTotalQuantity(inv.getId());
        }
        
        return inventoryRepository.findByKitchenId(kitchenId).stream()
                .filter(inventory -> {
                    // Match dashboard logic exactly - only check active items, not total quantity
                    Long activeCount = inventoryItemRepository.countByInventoryIdAndIsActiveTrue(inventory.getId());
                    return activeCount != null && activeCount > 0;
                })
                .map(inventory -> {
                    InventoryResponseDTO dto = inventoryMapper.toResponseDTO(inventory);
                    dto.setEarliestExpiry(inventoryItemRepository.findEarliestExpiryByInventoryId(inventory.getId()));
                    return dto;
                })
                .toList();
    }
    
    @Transactional
    public InventoryItemResponseDTO updateInventoryItem(Long itemId, UpdateInventoryItemRequestDTO dto) {
        InventoryItem item = inventoryItemRepository.findById(itemId)
                .orElseThrow(() -> new ItemNotFoundException(itemId));
        
        if (dto.getDescription() != null) item.setDescription(dto.getDescription());
        if (dto.getQuantity() != null) {
            // Convert quantity if needed (assuming same unit as existing item)
            String currentUnitName = item.getInventory().getUnit().getName();
            Long convertedQuantity = UnitConversionUtil.convertToBaseUnit(dto.getQuantity(), currentUnitName);
            // Legacy support - convert to new fields
        BigDecimal quantityBD = new BigDecimal(convertedQuantity);
        if (item.getOriginalQuantity() == null) {
            item.setOriginalQuantity(quantityBD);
        }
        item.setCurrentQuantity(quantityBD);
        }
        if (dto.getLocationId() != null) {
            Location location = locationRepository.findById(dto.getLocationId()).orElse(null);
            item.setLocation(location);
        }
        if (dto.getExpiryDate() != null) item.setExpiryDate(dto.getExpiryDate());
        if (dto.getPrice() != null) item.setPrice(dto.getPrice());
        
        InventoryItem saved = inventoryItemRepository.save(item);
        
        // Update total quantity
        updateInventoryTotalQuantity(item.getInventory().getId());
        
        return inventoryItemMapper.toResponseDTO(saved);
    }

    public InventoryItemResponseDTO getInventoryItemByItemId(Long itemId) {
        InventoryItem item = inventoryItemRepository.findById(itemId)
                .orElseThrow(() -> new ItemNotFoundException(itemId));
        return inventoryItemMapper.toResponseDTO(item);
    }
    
    private void recordConsumptionEvent(InventoryItem item, ConsumptionEvent.EventReason reason) {
        try {
            Kitchen kitchen = kitchenRepository.findById(item.getInventory().getKitchenId()).orElse(null);
            User user = item.getCreatedByUser();
            
            if (kitchen != null) {
                ConsumptionEvent event = ConsumptionEvent.builder()
                    .canonicalName(item.getInventory().getName())
                    .quantityConsumed(BigDecimal.valueOf(item.getQuantity()))
                    .kitchen(kitchen)
                    .reason(reason)
                    .triggeredBy(user)
                    .build();
                    
                consumptionEventRepository.save(event);
            }
        } catch (Exception e) {
            System.err.println("Failed to record consumption event: " + e.getMessage());
        }
    }
    
    private Inventory findOrCreateInventory(String name, Long categoryId, Long unitId, Long kitchenId) {
        String normalizedName = NameNormalizationUtil.normalizeName(name);
        
        // First try exact normalized match
        Optional<Inventory> existing = inventoryRepository
                .findByNormalizedNameAndCategoryIdAndUnitIdAndKitchenId(normalizedName, categoryId, unitId, kitchenId);
        
        if (existing.isPresent()) {
            return existing.get();
        }
        
        // Check if there's an existing inventory with same normalized name but different display name
        List<String> existingNames = inventoryRepository
                .findExistingNamesByKitchenAndCategoryAndUnit(kitchenId, categoryId, unitId);
        
        for (String existingName : existingNames) {
            if (NameNormalizationUtil.normalizeName(existingName).equals(normalizedName)) {
                return inventoryRepository
                        .findByNormalizedNameAndCategoryIdAndUnitIdAndKitchenId(normalizedName, categoryId, unitId, kitchenId)
                        .orElse(null);
            }
        }
        
        // Try fuzzy matching with existing names
        try {
            String bestMatch = NameNormalizationUtil.findBestMatch(name, existingNames);
            if (bestMatch != null) {
                String bestMatchNormalized = NameNormalizationUtil.normalizeName(bestMatch);
                Optional<Inventory> fuzzyMatch = inventoryRepository
                        .findByNormalizedNameAndCategoryIdAndUnitIdAndKitchenId(bestMatchNormalized, categoryId, unitId, kitchenId);
                if (fuzzyMatch.isPresent()) {
                    return fuzzyMatch.get();
                }
            }
        } catch (Exception e) {
            // Continue to create new inventory if fuzzy matching fails
        }
        
        // Create new inventory
        try {
            // Check if inventory already exists (handle race condition)
            Optional<Inventory> raceCheck = inventoryRepository
                    .findByNormalizedNameAndCategoryIdAndUnitIdAndKitchenId(normalizedName, categoryId, unitId, kitchenId);
            if (raceCheck.isPresent()) {
                return raceCheck.get();
            }
            
            Inventory inventory = new Inventory();
            inventory.setName(NameNormalizationUtil.capitalizeDisplayName(name));
            inventory.setNormalizedName(normalizedName);
            inventory.setKitchenId(kitchenId);
            
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new ItemNotFoundException("Category not found: " + categoryId));
            Unit unit = unitRepository.findById(unitId)
                    .orElseThrow(() -> new ItemNotFoundException("Unit not found: " + unitId));
            
            inventory.setCategory(category);
            inventory.setUnit(unit);
            inventory.setTotalQuantity(0L);
            inventory.setItemCount(0);
            
            return inventoryRepository.save(inventory);
        } catch (Exception e) {
            // If save fails due to constraint, try to find existing again
            return inventoryRepository
                    .findByNormalizedNameAndCategoryIdAndUnitIdAndKitchenId(normalizedName, categoryId, unitId, kitchenId)
                    .orElseThrow(() -> new RuntimeException("Failed to create or find inventory: " + e.getMessage()));
        }
    }
    
    private void updateInventoryTotalQuantity(Long inventoryId) {
        BigDecimal totalQuantity = inventoryItemRepository.sumCurrentQuantityByInventoryId(inventoryId);
        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new ItemNotFoundException(inventoryId));
        
        // If totalQuantity is 0 but there are active items, recalculate from active items
        if ((totalQuantity == null || totalQuantity.longValue() == 0)) {
            Long activeCount = inventoryItemRepository.countByInventoryIdAndIsActiveTrue(inventoryId);
            if (activeCount != null && activeCount > 0) {
                // Force update totalQuantity to 1 if there are active items to ensure frontend shows them
                inventory.setTotalQuantity(1L);
            } else {
                inventory.setTotalQuantity(0L);
            }
        } else {
            inventory.setTotalQuantity(totalQuantity.longValue());
        }
        
        // Update item count to only active items
        Long activeItemCount = inventoryItemRepository.countByInventoryIdAndIsActiveTrue(inventoryId);
        inventory.setItemCount(activeItemCount != null ? activeItemCount.intValue() : 0);
        
        inventoryRepository.save(inventory);
    }
    
    // New method to support OCR integration
    public InventoryItem addItemFromOcr(AiExtractedItems aiItem, Long userId) {
        // Find or create category
        Category category = categoryRepository.findByName(aiItem.getCategoryName())
            .orElseGet(() -> {
                Category newCategory = new Category();
                newCategory.setName(aiItem.getCategoryName());
                newCategory.setDescription("Auto-created from OCR");
                return categoryRepository.save(newCategory);
            });
        
        // Find or create unit
        Unit unit = unitRepository.findByName(aiItem.getUnitName())
            .orElseGet(() -> {
                Unit newUnit = new Unit();
                newUnit.setName(aiItem.getUnitName());
                newUnit.setType("weight");
                return unitRepository.save(newUnit);
            });
        
        // Find kitchen ID from OCR upload
        Long kitchenId = getKitchenIdFromOcrUpload(aiItem.getOcrUploadId());
        
        // Find or create inventory
        Inventory inventory = findOrCreateInventory(
            aiItem.getCanonicalName(), 
            category.getId(), 
            unit.getId(), 
            kitchenId
        );
        
        // Create inventory item
        InventoryItem item = InventoryItem.builder()
            .inventory(inventory)
            .description(aiItem.getRawName())
            .originalQuantity(BigDecimal.valueOf(aiItem.getQuantity()))
            .currentQuantity(BigDecimal.valueOf(aiItem.getQuantity()))
            .isActive(true)
            .status(InventoryItem.ItemStatus.FRESH)
            .expiryDate(aiItem.getExpiryDate() != null ? 
                       java.sql.Date.valueOf(aiItem.getExpiryDate()) : null)
            .price(aiItem.getPrice() != null ? BigDecimal.valueOf(aiItem.getPrice()) : null)
            .createdBy(userId)
            .build();
        
        InventoryItem saved = inventoryItemRepository.save(item);
        
        // Update inventory totals
        updateInventoryTotalQuantity(inventory.getId());
        
        return saved;
    }
    
    private Long getKitchenIdFromOcrUpload(Long ocrUploadId) {
        // For now returning a default value - this should be implemented properly
        return 1L;
    }

    @Override
    @Transactional
    public ConsumeItemsResponseDTO consumeItems(ConsumeItemsRequestDTO dto) {
        List<ConsumeItemsResponseDTO.ConsumedItemDetail> consumedDetails = new ArrayList<>();
        
        for (ConsumeItemsRequestDTO.ConsumeItemDTO consumeItem : dto.getItems()) {
            // Always treat as inventory group for FIFO consumption
            Optional<Inventory> inventory = inventoryRepository.findById(consumeItem.getId());
            
            if (inventory.isPresent()) {
                Inventory inv = inventory.get();
                BigDecimal requestedQuantity = consumeItem.getConsumedQuantity();
                
                // Get active items ordered by expiry date (FIFO)
                List<InventoryItem> items = inventoryItemRepository
                    .findByInventoryIdAndIsActiveTrueOrderByExpiryDateAsc(inv.getId());
                
                // Check if sufficient quantity available
                BigDecimal totalAvailable = items.stream()
                    .map(InventoryItem::getCurrentQuantity)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                
                if (requestedQuantity.compareTo(totalAvailable) > 0) {
                    throw new RuntimeException("Insufficient quantity. Requested: " + requestedQuantity + 
                                             ", Available: " + totalAvailable);
                }
                
                BigDecimal remainingToConsume = requestedQuantity;
                List<ConsumeItemsResponseDTO.ItemConsumptionDetail> itemDetails = new ArrayList<>();
                
                for (InventoryItem item : items) {
                    if (remainingToConsume.compareTo(BigDecimal.ZERO) <= 0) break;
                    
                    BigDecimal toConsumeFromThisItem = remainingToConsume.min(item.getCurrentQuantity());
                    
                    // CREATE USAGE LOG for each item
                    createUsageLogForConsumption(item, toConsumeFromThisItem, dto.getUserId());
                    
                    // Update item quantity
                    BigDecimal newQuantity = item.getCurrentQuantity().subtract(toConsumeFromThisItem);
                    remainingToConsume = remainingToConsume.subtract(toConsumeFromThisItem);
                    
                    // Create consumption detail
                    ConsumeItemsResponseDTO.ItemConsumptionDetail detail = 
                        ConsumeItemsResponseDTO.ItemConsumptionDetail.builder()
                            .itemId(item.getId())
                            .expiryDate(item.getExpiryDate())
                            .addedBy(item.getCreatedBy())
                            .addedByName(getUserName(item.getCreatedBy()))
                            .quantityConsumed(toConsumeFromThisItem)
                            .remainingQuantity(newQuantity)
                            .build();
                    itemDetails.add(detail);
                    
                    if (newQuantity.compareTo(BigDecimal.ZERO) <= 0) {
                        item.setCurrentQuantity(BigDecimal.ZERO);
                        item.setIsActive(false);
                        item.setStatus(InventoryItem.ItemStatus.CONSUMED);
                    } else {
                        item.setCurrentQuantity(newQuantity);
                    }
                    
                    inventoryItemRepository.save(item);
                }
                
                updateInventoryTotalQuantity(inv.getId());
                
                ConsumeItemsResponseDTO.ConsumedItemDetail consumedDetail = 
                    ConsumeItemsResponseDTO.ConsumedItemDetail.builder()
                        .inventoryId(inv.getId())
                        .itemName(inv.getName())
                        .totalConsumed(requestedQuantity)
                        .unit(inv.getUnit().getName())
                        .itemDetails(itemDetails)
                        .build();
                consumedDetails.add(consumedDetail);
            } else {
                throw new RuntimeException("Inventory not found with ID: " + consumeItem.getId());
            }
        }
        
        return ConsumeItemsResponseDTO.builder()
            .consumedItems(consumedDetails)
            .totalItemsConsumed(consumedDetails.size())
            .build();
    }
    
    private String getUserName(Long userId) {
        if (userId == null) return "Unknown";
        return userRepository.findById(userId)
            .map(User::getName)
            .orElse("Unknown");
    }
    
    @Override
    public InventoryConsumptionInfoDTO getConsumptionInfo(Long inventoryId) {
        Inventory inventory = inventoryRepository.findById(inventoryId)
            .orElseThrow(() -> new ItemNotFoundException(inventoryId));
        
        List<InventoryItem> activeItems = inventoryItemRepository
            .findByInventoryIdAndIsActiveTrueOrderByExpiryDateAsc(inventoryId);
        
        BigDecimal totalAvailable = activeItems.stream()
            .map(InventoryItem::getCurrentQuantity)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        List<InventoryConsumptionInfoDTO.AvailableItemDetail> itemDetails = activeItems.stream()
            .map(item -> InventoryConsumptionInfoDTO.AvailableItemDetail.builder()
                .itemId(item.getId())
                .quantity(item.getCurrentQuantity())
                .expiryDate(item.getExpiryDate())
                .addedByName(getUserName(item.getCreatedBy()))
                .addedDate(item.getCreatedAt())
                .build())
            .collect(Collectors.toList());
        
        return InventoryConsumptionInfoDTO.builder()
            .inventoryId(inventoryId)
            .itemName(inventory.getName())
            .totalAvailable(totalAvailable)
            .unit(inventory.getUnit().getName())
            .availableItems(itemDetails)
            .build();
    }
    
    private void createUsageLogForConsumption(InventoryItem item, BigDecimal quantity, Long userId) {
        try {
            UsageLog usageLog = UsageLog.builder()
                .inventoryItemId(item.getId())
                .kitchenId(item.getInventory().getKitchenId())
                .userId(userId)
                .quantityUsed(quantity)
                .unit(item.getInventory().getUnit())
                .usageType(UsageLog.UsageType.DIRECT_CONSUMPTION)
                .notes("Manual consumption")
                .build();
            usageLogRepository.save(usageLog);
        } catch (Exception e) {
            log.warn("Failed to create usage log for item: {}", item.getId(), e);
        }
    }
    
    @Override
    public List<InventoryItemResponseDTO> getExpiredItems(Long kitchenId) {
        System.out.println("=== GET EXPIRED ITEMS CALLED ===");
        System.out.println("Kitchen ID: " + kitchenId);
        
        // Get waste logs for expired items
        List<com.innogent.pantry_mind.entity.WasteLog> wasteLogs = wasteLogRepository
            .findByKitchenIdAndWasteReason(kitchenId, com.innogent.pantry_mind.entity.WasteLog.WasteReason.EXPIRED);
        
        System.out.println("Found " + wasteLogs.size() + " expired waste logs");
        
        // Convert waste logs to InventoryItemResponseDTO
        return wasteLogs.stream()
            .map(wasteLog -> {
                InventoryItemResponseDTO dto = new InventoryItemResponseDTO();
                dto.setId(wasteLog.getInventoryItemId());
                dto.setQuantity(wasteLog.getQuantityWasted().longValue());
                dto.setPrice(wasteLog.getEstimatedValue());
                dto.setDescription(wasteLog.getNotes());
                dto.setCreatedAt(java.sql.Date.from(wasteLog.getWastedAt().atZone(java.time.ZoneId.systemDefault()).toInstant()));
                
                // Use itemName field if available, otherwise fallback to "Expired Item"
                if (wasteLog.getItemName() != null && !wasteLog.getItemName().isEmpty()) {
                    dto.setDescription(wasteLog.getItemName());
                } else {
                    dto.setDescription("Expired Item");
                }
                

                
                return dto;
            })
            .collect(Collectors.toList());
    }

}
