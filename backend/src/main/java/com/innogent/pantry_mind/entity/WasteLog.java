package com.innogent.pantry_mind.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "waste_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WasteLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "inventory_item_id", nullable = false)
    private Long inventoryItemId;
    
    @Column(name = "kitchen_id", nullable = false)
    private Long kitchenId;
    
    @Column(name = "item_name")
    private String itemName;
    
    @Column(name = "reported_by")
    private Long reportedBy;
    
    @Column(name = "quantity_wasted", nullable = false)
    private BigDecimal quantityWasted;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id")
    private Unit unit;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "waste_reason", nullable = false)
    private WasteReason wasteReason;
    
    @Column(name = "estimated_value")
    private BigDecimal estimatedValue;
    
    @Column(name = "expiry_date")
    private LocalDate expiryDate;
    
    @Column(name = "notes")
    private String notes;
    
    @CreationTimestamp
    @Column(name = "wasted_at")
    private LocalDateTime wastedAt;
    
    public enum WasteReason {
        EXPIRED, SPOILED, OVERCOOKED, LEFTOVER_DISCARDED, ACCIDENTAL, OTHER
    }
}