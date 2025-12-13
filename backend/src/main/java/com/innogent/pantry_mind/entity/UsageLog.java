package com.innogent.pantry_mind.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "usage_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsageLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "inventory_item_id", nullable = false)
    private Long inventoryItemId;
    
    @Column(name = "kitchen_id", nullable = false)
    private Long kitchenId;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "quantity_used", nullable = false)
    private BigDecimal quantityUsed;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id")
    private Unit unit;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "usage_type", nullable = false)
    private UsageType usageType;
    
    @Column(name = "recipe_name")
    private String recipeName;
    
    @Column(name = "meal_log_id")
    private Long mealLogId;
    
    @Column(name = "notes")
    private String notes;
    
    @CreationTimestamp
    @Column(name = "used_at")
    private LocalDateTime usedAt;
    
    public enum UsageType {
        COOKING, DIRECT_CONSUMPTION, SHARING, OTHER
    }
}