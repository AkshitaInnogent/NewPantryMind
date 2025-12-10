package com.innogent.pantry_mind.service.impl;

import com.innogent.pantry_mind.dto.request.ConsumeItemsRequestDTO;
import com.innogent.pantry_mind.dto.request.CreateInventoryItemRequestDTO;
import com.innogent.pantry_mind.dto.request.UpdateInventoryItemRequestDTO;
import com.innogent.pantry_mind.dto.request.UpdateInventoryAlertsRequestDTO;
import com.innogent.pantry_mind.dto.response.InventoryItemResponseDTO;
import com.innogent.pantry_mind.dto.response.InventoryResponseDTO;
import com.innogent.pantry_mind.mapper.InventoryItemMapper;
import com.innogent.pantry_mind.mapper.InventoryMapper;
import com.innogent.pantry_mind.entity.*;
import com.innogent.pantry_mind.repository.*;
import com.innogent.pantry_mind.util.NameNormalizationUtil;
import com.innogent.pantry_mind.util.UnitConversionUtil;
import com.innogent.pantry_mind.service.InventoryService;
import com.innogent.pantry_mind.exception.ItemNotFoundException;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final CategoryRepository categoryRepository;
    private final UnitRepository unitRepository;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;
    private final KitchenRepository kitchenRepository;
    private final ConsumptionEventRepository consumptionEventRepository;
    private final InventoryItemMapper inventoryItemMapper;
    private final InventoryMapper inventoryMapper;

    @Override
    @Transactional
    public InventoryItemResponseDTO addInventoryItem(CreateInventoryItemRequestDTO dto) {
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
        
        // Create inventory item
        InventoryItem item = new InventoryItem();
        item.setInventory(inventory);
        item.setDescription(dto.getDescription());
        item.setQuantity(convertedQuantity);
        if (dto.getLocationId() != null) {
            Location location = locationRepository.findById(dto.getLocationId()).orElse(null);
            item.setLocation(location);
        }
        item.setExpiryDate(dto.getExpiryDate());
        item.setPrice(dto.getPrice());
        item.setCreatedBy(dto.getCreatedBy());
        
        InventoryItem saved = inventoryItemRepository.save(item);
        
        // Update total quantity and item count
        updateInventoryTotalQuantity(inventory.getId());
        inventory.setItemCount(inventory.getItemCount() + 1);
        inventoryRepository.save(inventory);
        
        return inventoryItemMapper.toResponseDTO(saved);
    }

    @Override
    public List<InventoryResponseDTO> getAllInventoryItems() {
        // Update existing records with correct itemCount
        List<Inventory> inventories = inventoryRepository.findAll();
        for (Inventory inventory : inventories) {
            if (inventory.getItemCount() == 0) {
                Long count = inventoryItemRepository.countByInventoryId(inventory.getId());
                inventory.setItemCount(count != null ? count.intValue() : 1);
                inventoryRepository.save(inventory);
            }
        }
        
        return inventories.stream()
                .map(inventory -> {
                    InventoryResponseDTO dto = inventoryMapper.toResponseDTO(inventory);
                    dto.setEarliestExpiry(inventoryItemRepository.findEarliestExpiryByInventoryId(inventory.getId()));
                    return dto;
                })
                .toList();
    }

    // COMMENTED OUT - DUPLICATE METHOD (keeping the better version below)
    /*
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
                        .ifPresentOrElse(
                            user -> item.setCreatedByName(user.getName()),
                            () -> item.setCreatedByName("Unknown User")
                        );
                }
            });
        }
        
        // Set item count and earliest expiry
        response.setItemCount(response.getItems() != null ? response.getItems().size() : 0);
        response.setEarliestExpiry(inventoryItemRepository.findEarliestExpiryByInventoryId(id));
        
        return response;
    }
    */

    // COMMENTED OUT - DUPLICATE METHOD (keeping the better version below)
    /*
    @Override
    @Transactional
    public void deleteInventoryItem(Long id) {
        InventoryItem item = inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ItemNotFoundException(id));
        
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
    */

    // COMMENTED OUT - DUPLICATE METHOD (keeping the better version below)
    /*
    public List<InventoryResponseDTO> getInventoryItemsByKitchen(Long kitchenId) {
        return inventoryRepository.findByKitchenId(kitchenId).stream()
                .map(inventory -> {
                    InventoryResponseDTO dto = inventoryMapper.toResponseDTO(inventory);
                    dto.setEarliestExpiry(inventoryItemRepository.findEarliestExpiryByInventoryId(inventory.getId()));
                    return dto;
                })
                .toList();
    }
    */
    
    // COMMENTED OUT - DUPLICATE METHOD (keeping the better version below)
    /*
    @Transactional
    public InventoryItemResponseDTO updateInventoryItem(Long itemId, UpdateInventoryItemRequestDTO dto) {
        InventoryItem item = inventoryItemRepository.findById(itemId)
                .orElseThrow(() -> new ItemNotFoundException(itemId));
        
        if (dto.getDescription() != null) item.setDescription(dto.getDescription());
        if (dto.getQuantity() != null) {
            // Convert quantity if needed (assuming same unit as existing item)
            String currentUnitName = item.getInventory().getUnit().getName();
            Long convertedQuantity = UnitConversionUtil.convertToBaseUnit(dto.getQuantity(), currentUnitName);
            item.setQuantity(convertedQuantity);
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
    */

    // COMMENTED OUT - DUPLICATE METHOD (keeping the better version below)
    /*
    public InventoryItemResponseDTO getInventoryItemByItemId(Long itemId) {
        InventoryItem item = inventoryItemRepository.findById(itemId)
                .orElseThrow(() -> new ItemNotFoundException(itemId));
        return inventoryItemMapper.toResponseDTO(item);
    }
    */
    
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
    
    // COMMENTED OUT - DUPLICATE METHOD (keeping the better version below)
    /*
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
            Inventory inventory = new Inventory();
            inventory.setName(NameNormalizationUtil.capitalizeDisplayName(name));
            inventory.setKitchenId(kitchenId);
            
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new ItemNotFoundException("Category not found: " + categoryId));
            Unit unit = unitRepository.findById(unitId)
                    .orElseThrow(() -> new ItemNotFoundException("Unit not found: " + unitId));
            
            inventory.setCategory(category);
            inventory.setUnit(unit);
            inventory.setTotalQuantity(0L);
            
            return inventoryRepository.save(inventory);
        } catch (Exception e) {
            // If save fails due to constraint, try to find existing again
            return inventoryRepository
                    .findByNormalizedNameAndCategoryIdAndUnitIdAndKitchenId(normalizedName, categoryId, unitId, kitchenId)
                    .orElseThrow(() -> new RuntimeException("Failed to create or find inventory: " + e.getMessage()));
        }
    }
    */
    
    // COMMENTED OUT - DUPLICATE METHOD (keeping the better version below)
    /*
    private void updateInventoryTotalQuantity(Long inventoryId) {
        Long totalQuantity = inventoryItemRepository.sumQuantityByInventoryId(inventoryId);
        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new ItemNotFoundException(inventoryId));
        inventory.setTotalQuantity(totalQuantity != null ? totalQuantity : 0L);
        inventoryRepository.save(inventory);
    }
    */

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
        
        // Set item count and earliest expiry
        response.setItemCount(response.getItems() != null ? response.getItems().size() : 0);
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
        return inventoryRepository.findByKitchenId(kitchenId).stream()
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
            item.setQuantity(convertedQuantity);
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
            Inventory inventory = new Inventory();
            inventory.setName(NameNormalizationUtil.capitalizeDisplayName(name));
            inventory.setKitchenId(kitchenId);
            
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new ItemNotFoundException("Category not found: " + categoryId));
            Unit unit = unitRepository.findById(unitId)
                    .orElseThrow(() -> new ItemNotFoundException("Unit not found: " + unitId));
            
            inventory.setCategory(category);
            inventory.setUnit(unit);
            inventory.setTotalQuantity(0L);
            
            return inventoryRepository.save(inventory);
        } catch (Exception e) {
            // If save fails due to constraint, try to find existing again
            return inventoryRepository
                    .findByNormalizedNameAndCategoryIdAndUnitIdAndKitchenId(normalizedName, categoryId, unitId, kitchenId)
                    .orElseThrow(() -> new RuntimeException("Failed to create or find inventory: " + e.getMessage()));
        }
    }
    
    private void updateInventoryTotalQuantity(Long inventoryId) {
        Long totalQuantity = inventoryItemRepository.sumQuantityByInventoryId(inventoryId);
        Inventory inventory = inventoryRepository.findById(inventoryId)
                .orElseThrow(() -> new ItemNotFoundException(inventoryId));
        inventory.setTotalQuantity(totalQuantity != null ? totalQuantity : 0L);
        inventoryRepository.save(inventory);
    }

    // Add this method to your InventoryServiceImpl class
    @Transactional
    public void consumeItems(ConsumeItemsRequestDTO dto) {
        System.out.println("🔥 [BACKEND] Starting to consume " + dto.getItems().size() + " items");
        
        for (ConsumeItemsRequestDTO.ConsumeItemDTO consumeItem : dto.getItems()) {
            System.out.println("🔥 [BACKEND] Processing item ID: " + consumeItem.getId() + ", quantity: " + consumeItem.getConsumedQuantity());
            
            // First try to find as inventory item (individual item)
            Optional<InventoryItem> inventoryItem = inventoryItemRepository.findById(consumeItem.getId());
            
            if (inventoryItem.isPresent()) {
                System.out.println("✅ [BACKEND] Found individual inventory item: " + inventoryItem.get().getInventory().getName());
                // Handle individual inventory item
                InventoryItem item = inventoryItem.get();
                Long consumedQuantityLong = consumeItem.getConsumedQuantity().longValue();
                
                if (item.getQuantity() >= consumedQuantityLong) {
                    item.setQuantity(item.getQuantity() - consumedQuantityLong);
                    
                    if (item.getQuantity() == 0) {
                        recordConsumptionEvent(item, ConsumptionEvent.EventReason.CONSUMED);
                        Inventory inventory = item.getInventory();
                        inventoryItemRepository.delete(item);
                        
                        inventory.setItemCount(inventory.getItemCount() - 1);
                        if (inventory.getItemCount() <= 0) {
                            inventoryRepository.delete(inventory);
                        } else {
                            updateInventoryTotalQuantity(inventory.getId());
                            inventoryRepository.save(inventory);
                        }
                    } else {
                        inventoryItemRepository.save(item);
                        updateInventoryTotalQuantity(item.getInventory().getId());
                    }
                }
            } else {
                System.out.println("🔍 [BACKEND] Not found as individual item, trying as inventory group...");
                // Try to find as inventory group and consume from its items
                Optional<Inventory> inventory = inventoryRepository.findById(consumeItem.getId());
                
                if (inventory.isPresent()) {
                    System.out.println("✅ [BACKEND] Found inventory group: " + inventory.get().getName());
                    Inventory inv = inventory.get();
                    Long consumedQuantityLong = consumeItem.getConsumedQuantity().longValue();
                    
                    // Get all items for this inventory group
                    List<InventoryItem> items = inventoryItemRepository.findByInventoryIdOrderByExpiryDateAsc(inv.getId());
                    System.out.println("📦 [BACKEND] Found " + items.size() + " items in group");
                    
                    Long remainingToConsume = consumedQuantityLong;
                    
                    for (InventoryItem item : items) {
                        if (remainingToConsume <= 0) break;
                        
                        Long toConsumeFromThisItem = Math.min(remainingToConsume, item.getQuantity());
                        System.out.println("🍽️ [BACKEND] Consuming " + toConsumeFromThisItem + " from item " + item.getId());
                        
                        item.setQuantity(item.getQuantity() - toConsumeFromThisItem);
                        remainingToConsume -= toConsumeFromThisItem;
                        
                        if (item.getQuantity() == 0) {
                            recordConsumptionEvent(item, ConsumptionEvent.EventReason.CONSUMED);
                            inventoryItemRepository.delete(item);
                            inv.setItemCount(inv.getItemCount() - 1);
                        } else {
                            inventoryItemRepository.save(item);
                        }
                    }
                    
                    // Update inventory totals
                    if (inv.getItemCount() <= 0) {
                        inventoryRepository.delete(inv);
                    } else {
                        updateInventoryTotalQuantity(inv.getId());
                        inventoryRepository.save(inv);
                    }
                } else {
                    System.err.println("❌ [BACKEND] Inventory item not found with ID: " + consumeItem.getId());
                    throw new RuntimeException("Inventory item not found with ID: " + consumeItem.getId());
                }
            }
        }
        
        System.out.println("✅ [BACKEND] Successfully consumed all items");
    }

}
