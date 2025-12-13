package com.innogent.pantry_mind.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "purchase_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "kitchen_id", nullable = false)
    private Long kitchenId;
    
    @Column(name = "purchased_by", nullable = false)
    private Long purchasedBy;
    
    @Column(name = "item_name", nullable = false)
    private String itemName;
    
    @Column(name = "brand")
    private String brand;
    
    @Column(name = "quantity", nullable = false)
    private BigDecimal quantity;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id")
    private Unit unit;
    
    @Column(name = "price_paid", nullable = false)
    private BigDecimal pricePaid;
    
    @Column(name = "store_name")
    private String storeName;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "purchase_source")
    private PurchaseSource purchaseSource;
    
    @Column(name = "receipt_reference")
    private String receiptReference;
    
    @Column(name = "expiry_date")
    private LocalDate expiryDate;
    
    @Column(name = "inventory_item_id")
    private Long inventoryItemId; // Link to created inventory item
    
    @CreationTimestamp
    @Column(name = "purchased_at")
    private LocalDateTime purchasedAt;
    
    public enum PurchaseSource {
        GROCERY_STORE, ONLINE, FARMERS_MARKET, BULK_STORE, OTHER
    }
}