package com.innogent.pantry_mind.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.List;
// backend/src/main/java/com/innogent/pantry_mind/entity/ShoppingList.java
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "shopping_lists")
public class ShoppingList {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ListType listType;  // Changed from 'name' to 'listType'
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kitchen_id", nullable = false)
    private Kitchen kitchen;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ListStatus status = ListStatus.ACTIVE;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "shoppingList", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ShoppingListItem> items;
    
    public enum ListType {
        DAILY, WEEKLY, MONTHLY, RANDOM
    }
    
    public enum ListStatus {
        ACTIVE, COMPLETED, ARCHIVED
    }
}
