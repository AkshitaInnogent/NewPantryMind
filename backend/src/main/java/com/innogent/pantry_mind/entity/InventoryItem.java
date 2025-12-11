package com.innogent.pantry_mind.entity;

import java.math.BigDecimal;
import java.util.Date;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "inventory_item")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_id")
    private Inventory inventory;
    
    private String description;
    
    @Column(name = "original_quantity", nullable = false)
    private BigDecimal originalQuantity; // Never changes after creation
    
    @Column(name = "current_quantity", nullable = false)
    private BigDecimal currentQuantity; // Gets reduced with usage
    
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private ItemStatus status = ItemStatus.FRESH;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private Location location;
    
    @Column(name = "expiry_date")
    private Date expiryDate;
    
    private BigDecimal price;
    
    @Column(name = "created_by")
    private Long createdBy;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", insertable = false, updatable = false)
    private User createdByUser;

    @CreationTimestamp
    @Column(name = "created_at")
    private Date createdAt;
    
    // Legacy support - keep old quantity field for backward compatibility
    @Deprecated
    public Long getQuantity() {
        return currentQuantity != null ? currentQuantity.longValue() : 0L;
    }
    
    @Deprecated
    public void setQuantity(Long quantity) {
        if (quantity != null) {
            this.currentQuantity = new BigDecimal(quantity);
            if (this.originalQuantity == null) {
                this.originalQuantity = new BigDecimal(quantity);
            }
        }
    }
    
    public enum ItemStatus {
        FRESH, EXPIRING_SOON, EXPIRED, CONSUMED, WASTED
    }
}
