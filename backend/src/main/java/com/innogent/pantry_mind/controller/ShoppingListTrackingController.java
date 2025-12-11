package com.innogent.pantry_mind.controller;

import com.innogent.pantry_mind.entity.PurchaseLog;
import com.innogent.pantry_mind.service.ShoppingListTrackingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/shopping-list")
@RequiredArgsConstructor
public class ShoppingListTrackingController {
    
    private final ShoppingListTrackingService shoppingListTrackingService;
    
    @PostMapping("/{itemId}/mark-purchased")
    public ResponseEntity<PurchaseLog> markItemAsPurchased(
            @PathVariable Long itemId,
            @RequestBody MarkPurchasedRequest request) {
        
        PurchaseLog purchaseLog = shoppingListTrackingService.markItemAsPurchased(
            itemId, 
            request.getActualPrice(), 
            request.getStoreName(),
            request.getPurchasedBy()
        );
        
        return ResponseEntity.ok(purchaseLog);
    }
    
    public static class MarkPurchasedRequest {
        private BigDecimal actualPrice;
        private String storeName;
        private Long purchasedBy;
        
        // Getters and setters
        public BigDecimal getActualPrice() { return actualPrice; }
        public void setActualPrice(BigDecimal actualPrice) { this.actualPrice = actualPrice; }
        public String getStoreName() { return storeName; }
        public void setStoreName(String storeName) { this.storeName = storeName; }
        public Long getPurchasedBy() { return purchasedBy; }
        public void setPurchasedBy(Long purchasedBy) { this.purchasedBy = purchasedBy; }
    }
}