package com.innogent.pantry_mind.service;

import com.innogent.pantry_mind.entity.*;
import com.innogent.pantry_mind.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Date;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryTrackingService {
    
    private final InventoryItemRepository inventoryItemRepository;
    private final InventoryRepository inventoryRepository;
    private final UsageLogRepository usageLogRepository;
    private final MealLogRepository mealLogRepository;
    private final WasteLogRepository wasteLogRepository;
    private final PurchaseLogRepository purchaseLogRepository;
    private final NotificationService notificationService;

    @Transactional
    public void useItem(Long itemId, BigDecimal usedQuantity, UsageLog.UsageType usageType,
                        String recipeName, String notes, Long userId, Long mealLogId) {

        InventoryItem item = inventoryItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        // Create usage log with meal log reference
        UsageLog usageLog = UsageLog.builder()
                .inventoryItemId(itemId)
                .kitchenId(item.getInventory().getKitchenId())
                .userId(userId)
                .quantityUsed(usedQuantity)
                .unit(item.getInventory().getUnit())
                .usageType(usageType)  // This will be COOKING when called from logMeal
                .recipeName(recipeName)
                .notes(notes)
                .mealLogId(mealLogId)  // This will be set when called from logMeal
                .build();
        usageLogRepository.save(usageLog);

        // Update item quantity
        BigDecimal newQuantity = item.getCurrentQuantity().subtract(usedQuantity);
        item.setCurrentQuantity(newQuantity);

        // Update status based on quantity
        if (newQuantity.compareTo(BigDecimal.ZERO) <= 0) {
            item.setIsActive(false);
            item.setStatus(InventoryItem.ItemStatus.CONSUMED);
        }

        inventoryItemRepository.save(item);
        updateInventoryTotals(item.getInventory().getId());
    }

    @Transactional
    public MealLog logMeal(Long kitchenId, Long cookedBy, String mealName, MealLog.MealType mealType,
                           Integer servings, List<IngredientUsage> ingredients, String recipeData) {

        // Create and save meal log first to get the ID
        MealLog mealLog = MealLog.builder()
                .kitchenId(kitchenId)
                .cookedBy(cookedBy)
                .mealName(mealName)
                .mealType(mealType)
                .servings(servings)
                .recipeData(recipeData)
                .build();
        mealLog = mealLogRepository.save(mealLog);

        // Process each ingredient with the meal log ID
        StringBuilder ingredientsUsed = new StringBuilder();
        for (IngredientUsage ingredient : ingredients) {
            // Use the item with the meal log ID
            useItem(
                    ingredient.getItemId(),
                    ingredient.getQuantity(),
                    UsageLog.UsageType.COOKING,  // This ensures it's marked as cooking, not direct consumption
                    mealName,
                    "Used in meal: " + mealName,
                    cookedBy,
                    mealLog.getId()  // Pass the meal log ID to associate the usage
            );

            ingredientsUsed.append(ingredient.getName())
                    .append(": ")
                    .append(ingredient.getQuantity())
                    .append(", ");
        }

        // Update meal log with ingredients
        mealLog.setIngredientsUsed(ingredientsUsed.toString());
        return mealLogRepository.save(mealLog);
    }
    
    @Transactional
    public void wasteItem(Long itemId, BigDecimal wastedQuantity, WasteLog.WasteReason reason,
                         String notes, Long reportedBy) {
        
        InventoryItem item = inventoryItemRepository.findById(itemId)
            .orElseThrow(() -> new RuntimeException("Item not found"));
        
        // Calculate estimated value
        BigDecimal estimatedValue = calculateEstimatedValue(item, wastedQuantity);
        
        // Create waste log
        WasteLog wasteLog = WasteLog.builder()
            .inventoryItemId(itemId)
            .kitchenId(item.getInventory().getKitchenId())
            .reportedBy(reportedBy)
            .quantityWasted(wastedQuantity)
            .unit(item.getInventory().getUnit())
            .wasteReason(reason)
            .estimatedValue(estimatedValue)
            .expiryDate(item.getExpiryDate() != null ? 
                       item.getExpiryDate().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate() : null)
            .notes(notes)
            .build();
        wasteLogRepository.save(wasteLog);
        
        // Update item quantity
        BigDecimal newQuantity = item.getCurrentQuantity().subtract(wastedQuantity);
        if (newQuantity.compareTo(BigDecimal.ZERO) <= 0) {
            item.setCurrentQuantity(BigDecimal.ZERO);
            item.setIsActive(false);
            item.setStatus(InventoryItem.ItemStatus.WASTED);
        } else {
            item.setCurrentQuantity(newQuantity);
        }
        
        inventoryItemRepository.save(item);
        updateInventoryTotals(item.getInventory().getId());
        
        // Send notification for waste logging
        String message = String.format("%s is wasted!", item.getInventory().getName());
        notificationService.sendInventoryAlert(item.getInventory().getKitchenId(), "ITEM_WASTED", message, itemId);
        
        log.info("Wasted {} of item {} due to {}", wastedQuantity, itemId, reason);
    }
    
    @Transactional
    public PurchaseLog logPurchase(Long kitchenId, Long purchasedBy, String itemName, String brand,
                                  BigDecimal quantity, Unit unit, BigDecimal pricePaid, String storeName,
                                  PurchaseLog.PurchaseSource source, String receiptReference, LocalDate expiryDate) {
        
        PurchaseLog purchaseLog = PurchaseLog.builder()
            .kitchenId(kitchenId)
            .purchasedBy(purchasedBy)
            .itemName(itemName)
            .brand(brand)
            .quantity(quantity)
            .unit(unit)
            .pricePaid(pricePaid)
            .storeName(storeName)
            .purchaseSource(source)
            .receiptReference(receiptReference)
            .expiryDate(expiryDate)
            .build();
        
        return purchaseLogRepository.save(purchaseLog);
    }
    
    @Transactional
    public void processExpiredItems(Long kitchenId) {
        java.util.Date today = new java.util.Date();
        
        log.info("=== PROCESSING EXPIRED ITEMS ===");
        log.info("Kitchen ID: {}", kitchenId);
        log.info("Current Date: {}", today);
        
        // First, let's see all active items in this kitchen
        List<InventoryItem> allActiveItems = inventoryItemRepository.findByKitchenId(kitchenId)
            .stream().filter(item -> item.getIsActive() != null && item.getIsActive()).toList();
        log.info("Total active items in kitchen: {}", allActiveItems.size());
        
        for (InventoryItem item : allActiveItems) {
            log.info("Item: {}, Expiry: {}, Active: {}", 
                item.getInventory().getName(), item.getExpiryDate(), item.getIsActive());
        }
        
        List<InventoryItem> expiredItems = inventoryItemRepository
            .findExpiredActiveItems(kitchenId, today);
        
        log.info("Found {} expired items for kitchen {}", expiredItems.size(), kitchenId);
        
        for (InventoryItem item : expiredItems) {
            log.info("Moving expired item {} to waste_log", item.getInventory().getName());
            
            wasteItem(item.getId(), item.getCurrentQuantity(), 
                     WasteLog.WasteReason.EXPIRED, 
                     "Auto-detected expired item", 
                     null); // System generated
            
            // Send notification for expired item
            String message = String.format("%s is expired!", 
                                         item.getInventory().getName());
            notificationService.sendInventoryAlert(kitchenId, "ITEM_EXPIRED", message, item.getId());
        }
        
        log.info("Successfully processed {} expired items for kitchen {}", expiredItems.size(), kitchenId);
    }
    
    private void updateInventoryTotals(Long inventoryId) {
        List<InventoryItem> activeItems = inventoryItemRepository
            .findByInventoryIdAndIsActiveTrue(inventoryId);
        
        BigDecimal totalQuantity = activeItems.stream()
            .map(InventoryItem::getCurrentQuantity)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        Inventory inventory = inventoryRepository.findById(inventoryId)
            .orElseThrow(() -> new RuntimeException("Inventory not found"));
        
        inventory.setTotalQuantity(totalQuantity.longValue());
        inventory.setItemCount(activeItems.size());
        inventoryRepository.save(inventory);
    }
    
    private BigDecimal calculateEstimatedValue(InventoryItem item, BigDecimal wastedQuantity) {
        if (item.getPrice() == null || item.getOriginalQuantity() == null) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal pricePerUnit = item.getPrice().divide(item.getOriginalQuantity(), 4, BigDecimal.ROUND_HALF_UP);
        return pricePerUnit.multiply(wastedQuantity);
    }
    
    // Helper class for ingredient usage
    public static class IngredientUsage {
        private Long itemId;
        private String name;
        private BigDecimal quantity;
        
        // Constructors, getters, setters
        public IngredientUsage(Long itemId, String name, BigDecimal quantity) {
            this.itemId = itemId;
            this.name = name;
            this.quantity = quantity;
        }
        
        public Long getItemId() { return itemId; }
        public String getName() { return name; }
        public BigDecimal getQuantity() { return quantity; }
    }

    public List<MealLog> getMealLogsWithUsage(Long kitchenId) {
        List<MealLog> mealLogs = mealLogRepository.findByKitchenIdOrderByCookedAtDesc(kitchenId);

        // For each meal log, fetch its associated usage logs
        mealLogs.forEach(mealLog -> {
            List<UsageLog> usageLogs = usageLogRepository.findByMealLogId(mealLog.getId());
            // You can add these to a DTO or handle as needed
        });

        return mealLogs;
    }
    
    public List<InventoryItem> getAllActiveItemsForKitchen(Long kitchenId) {
        return inventoryItemRepository.findByKitchenId(kitchenId)
            .stream()
            .filter(item -> item.getIsActive() != null && item.getIsActive())
            .collect(java.util.stream.Collectors.toList());
    }
}