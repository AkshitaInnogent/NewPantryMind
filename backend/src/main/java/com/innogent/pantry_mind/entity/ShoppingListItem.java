package com.innogent.pantry_mind.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "shopping_list_items")
public class ShoppingListItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shopping_list_id", nullable = false)
    private ShoppingList shoppingList;
    
    @Column(name = "canonical_name", nullable = false)
    private String canonicalName;
    
    @Column(name = "raw_name")
    private String rawName;
    
    @Column(name = "suggested_quantity")
    private BigDecimal suggestedQuantity;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id")
    private Unit unit;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "suggested_by")
    @Builder.Default
    private SuggestionSource suggestedBy = SuggestionSource.MANUAL;
    
    @Column(name = "price_hint")
    private BigDecimal priceHint;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ItemStatus status = ItemStatus.PENDING;
    
    @Column(name = "purchased_at")
    private LocalDateTime purchasedAt;
    
    @Column(name = "suggestion_reason")
    private String suggestionReason;
    
    @Column(name = "confidence_score")
    private BigDecimal confidenceScore;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "added_by")
    private User addedBy;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum SuggestionSource {
        MANUAL, RULE, AI
    }
    
    public enum ItemStatus {
        PENDING, PURCHASED, DISMISSED
    }
}
