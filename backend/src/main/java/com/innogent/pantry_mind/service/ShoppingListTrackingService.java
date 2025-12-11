package com.innogent.pantry_mind.service;

import com.innogent.pantry_mind.entity.*;
import com.innogent.pantry_mind.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShoppingListTrackingService {
    
    private final ShoppingListItemRepository shoppingListItemRepository;
    private final InventoryTrackingService trackingService;
    private final InventoryService inventoryService;
    
    @Transactional
    public PurchaseLog markItemAsPurchased(Long shoppingListItemId, BigDecimal actualPrice, 
                                          String storeName, Long purchasedBy) {
        
        ShoppingListItem item = shoppingListItemRepository.findById(shoppingListItemId)
            .orElseThrow(() -> new RuntimeException("Shopping list item not found"));
        
        // 1. Create purchase log
        PurchaseLog purchaseLog = trackingService.logPurchase(
            item.getShoppingList().getKitchen().getId(),
            purchasedBy,
            item.getCanonicalName(),
            null, // Brand not available
            item.getSuggestedQuantity(),
            item.getUnit(),
            actualPrice,
            storeName,
            PurchaseLog.PurchaseSource.GROCERY_STORE,
            "SHOPPING_LIST_" + shoppingListItemId,
            null // Expiry date not available
        );
        
        // 2. Create inventory item (you'll need to implement this method)
        // InventoryItem inventoryItem = inventoryService.createFromShoppingListItem(item, purchasedBy);
        
        // 3. Link purchase log to inventory item
        // purchaseLog.setInventoryItemId(inventoryItem.getId());
        
        // 4. Mark shopping list item as purchased
        item.setStatus(ShoppingListItem.ItemStatus.PURCHASED);
        item.setPurchasedAt(java.time.LocalDateTime.now());
        shoppingListItemRepository.save(item);
        
        log.info("Marked shopping list item {} as purchased for {}", 
                item.getCanonicalName(), actualPrice);
        
        return purchaseLog;
    }
}