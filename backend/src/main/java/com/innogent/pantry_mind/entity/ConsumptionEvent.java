package com.innogent.pantry_mind.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "consumption_events")
public class ConsumptionEvent {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "canonical_name", nullable = false)
    private String canonicalName;
    
    @Column(name = "quantity_consumed", nullable = false)
    private BigDecimal quantityConsumed;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id")
    private Unit unit;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kitchen_id", nullable = false)
    private Kitchen kitchen;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventReason reason;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "triggered_by")
    private User triggeredBy;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    public enum EventReason {
        RECIPE_COOKED, MANUAL_ADJUSTMENT, EXPIRED_REMOVED, CONSUMED
    }
}
