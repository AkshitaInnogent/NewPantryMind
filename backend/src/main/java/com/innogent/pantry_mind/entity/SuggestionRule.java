package com.innogent.pantry_mind.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "suggestion_rules")
public class SuggestionRule {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "canonical_name", nullable = false)
    private String canonicalName;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kitchen_id", nullable = false)
    private Kitchen kitchen;
    
    @Column(name = "reorder_threshold")
    private BigDecimal reorderThreshold;
    
    @Column(name = "suggested_quantity")
    private BigDecimal suggestedQuantity;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id")
    private Unit unit;
    
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
}
