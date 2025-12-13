package com.innogent.pantry_mind.controller;

import com.innogent.pantry_mind.entity.*;
import com.innogent.pantry_mind.service.InventoryTrackingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/tracking")
@RequiredArgsConstructor
public class InventoryTrackingController {
    
    private final InventoryTrackingService trackingService;
    
    // USAGE LOGS
    @PostMapping("/use-item")
    public ResponseEntity<String> useItem(@RequestBody UseItemRequest request) {
        trackingService.useItem(
            request.getItemId(),
            request.getQuantity(),
            request.getUsageType(),
            request.getRecipeName(),
            request.getNotes(),
            request.getUserId(),
            request.getMealLogId()
        );
        return ResponseEntity.ok("Item usage logged successfully");
    }
    
    // MEAL LOGS
    @PostMapping("/log-meal")
    public ResponseEntity<MealLog> logMeal(@RequestBody LogMealRequest request) {
        MealLog mealLog = trackingService.logMeal(
            request.getKitchenId(),
            request.getCookedBy(),
            request.getMealName(),
            request.getMealType(),
            request.getServings(),
            request.getIngredients(),
            request.getRecipeData()
        );
        return ResponseEntity.ok(mealLog);
    }
    
    // WASTE LOGS
    @PostMapping("/waste-item")
    public ResponseEntity<String> wasteItem(@RequestBody WasteItemRequest request) {
        trackingService.wasteItem(
            request.getItemId(),
            request.getQuantity(),
            request.getReason(),
            request.getNotes(),
            request.getReportedBy()
        );
        return ResponseEntity.ok("Waste logged successfully");
    }
    
    // PURCHASE LOGS
    @PostMapping("/log-purchase")
    public ResponseEntity<PurchaseLog> logPurchase(@RequestBody LogPurchaseRequest request) {
        PurchaseLog purchaseLog = trackingService.logPurchase(
            request.getKitchenId(),
            request.getPurchasedBy(),
            request.getItemName(),
            request.getBrand(),
            request.getQuantity(),
            request.getUnit(),
            request.getPricePaid(),
            request.getStoreName(),
            request.getSource(),
            request.getReceiptReference(),
            request.getExpiryDate()
        );
        return ResponseEntity.ok(purchaseLog);
    }
    
    // PROCESS EXPIRED ITEMS
    @PostMapping("/process-expired/{kitchenId}")
    public ResponseEntity<String> processExpiredItems(@PathVariable Long kitchenId) {
        trackingService.processExpiredItems(kitchenId);
        return ResponseEntity.ok("Expired items processed");
    }
    
    // TEST ENDPOINT - Check items and expiry dates
    @GetMapping("/check-items/{kitchenId}")
    public ResponseEntity<String> checkItems(@PathVariable Long kitchenId) {
        java.util.Date today = new java.util.Date();
        java.util.List<com.innogent.pantry_mind.entity.InventoryItem> allItems = 
            trackingService.getAllActiveItemsForKitchen(kitchenId);
        
        StringBuilder result = new StringBuilder();
        result.append("Today: ").append(today).append("\n\n");
        
        for (com.innogent.pantry_mind.entity.InventoryItem item : allItems) {
            result.append("Item: ").append(item.getInventory().getName())
                  .append(", Expiry: ").append(item.getExpiryDate())
                  .append(", Active: ").append(item.getIsActive())
                  .append(", Expired: ").append(item.getExpiryDate() != null && item.getExpiryDate().compareTo(today) <= 0)
                  .append("\n");
        }
        
        return ResponseEntity.ok(result.toString());
    }
    
    // REQUEST DTOs
    public static class UseItemRequest {
        private Long itemId;
        private BigDecimal quantity;
        private UsageLog.UsageType usageType;
        private String recipeName;
        private String notes;
        private Long userId;
        private Long mealLogId;
        
        // Getters and setters
        public Long getItemId() { return itemId; }
        public void setItemId(Long itemId) { this.itemId = itemId; }
        public BigDecimal getQuantity() { return quantity; }
        public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
        public UsageLog.UsageType getUsageType() { return usageType; }
        public void setUsageType(UsageLog.UsageType usageType) { this.usageType = usageType; }
        public String getRecipeName() { return recipeName; }
        public void setRecipeName(String recipeName) { this.recipeName = recipeName; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public Long getMealLogId() { return mealLogId; }
        public void setMealLogId(Long mealLogId) { this.mealLogId = mealLogId; }
    }
    
    public static class LogMealRequest {
        private Long kitchenId;
        private Long cookedBy;
        private String mealName;
        private MealLog.MealType mealType;
        private Integer servings;
        private List<InventoryTrackingService.IngredientUsage> ingredients;
        private String recipeData;
        
        // Getters and setters
        public Long getKitchenId() { return kitchenId; }
        public void setKitchenId(Long kitchenId) { this.kitchenId = kitchenId; }
        public Long getCookedBy() { return cookedBy; }
        public void setCookedBy(Long cookedBy) { this.cookedBy = cookedBy; }
        public String getMealName() { return mealName; }
        public void setMealName(String mealName) { this.mealName = mealName; }
        public MealLog.MealType getMealType() { return mealType; }
        public void setMealType(MealLog.MealType mealType) { this.mealType = mealType; }
        public Integer getServings() { return servings; }
        public void setServings(Integer servings) { this.servings = servings; }
        public List<InventoryTrackingService.IngredientUsage> getIngredients() { return ingredients; }
        public void setIngredients(List<InventoryTrackingService.IngredientUsage> ingredients) { this.ingredients = ingredients; }
        public String getRecipeData() { return recipeData; }
        public void setRecipeData(String recipeData) { this.recipeData = recipeData; }
    }
    
    public static class WasteItemRequest {
        private Long itemId;
        private BigDecimal quantity;
        private WasteLog.WasteReason reason;
        private String notes;
        private Long reportedBy;
        
        // Getters and setters
        public Long getItemId() { return itemId; }
        public void setItemId(Long itemId) { this.itemId = itemId; }
        public BigDecimal getQuantity() { return quantity; }
        public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
        public WasteLog.WasteReason getReason() { return reason; }
        public void setReason(WasteLog.WasteReason reason) { this.reason = reason; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public Long getReportedBy() { return reportedBy; }
        public void setReportedBy(Long reportedBy) { this.reportedBy = reportedBy; }
    }
    
    public static class LogPurchaseRequest {
        private Long kitchenId;
        private Long purchasedBy;
        private String itemName;
        private String brand;
        private BigDecimal quantity;
        private Unit unit;
        private BigDecimal pricePaid;
        private String storeName;
        private PurchaseLog.PurchaseSource source;
        private String receiptReference;
        private LocalDate expiryDate;
        
        // Getters and setters
        public Long getKitchenId() { return kitchenId; }
        public void setKitchenId(Long kitchenId) { this.kitchenId = kitchenId; }
        public Long getPurchasedBy() { return purchasedBy; }
        public void setPurchasedBy(Long purchasedBy) { this.purchasedBy = purchasedBy; }
        public String getItemName() { return itemName; }
        public void setItemName(String itemName) { this.itemName = itemName; }
        public String getBrand() { return brand; }
        public void setBrand(String brand) { this.brand = brand; }
        public BigDecimal getQuantity() { return quantity; }
        public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
        public Unit getUnit() { return unit; }
        public void setUnit(Unit unit) { this.unit = unit; }
        public BigDecimal getPricePaid() { return pricePaid; }
        public void setPricePaid(BigDecimal pricePaid) { this.pricePaid = pricePaid; }
        public String getStoreName() { return storeName; }
        public void setStoreName(String storeName) { this.storeName = storeName; }
        public PurchaseLog.PurchaseSource getSource() { return source; }
        public void setSource(PurchaseLog.PurchaseSource source) { this.source = source; }
        public String getReceiptReference() { return receiptReference; }
        public void setReceiptReference(String receiptReference) { this.receiptReference = receiptReference; }
        public LocalDate getExpiryDate() { return expiryDate; }
        public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }
    }
}