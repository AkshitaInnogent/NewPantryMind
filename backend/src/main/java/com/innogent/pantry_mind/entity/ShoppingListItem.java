package com.innogent.pantry_mind.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.util.Date;

@Data
@Entity
@Table(name = "shopping_list_items")
public class ShoppingListItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kitchen_id")
    private Kitchen kitchen;
    
    @Column(name = "item_name", nullable = false)
    private String itemName;
    
    private Long quantity;
    private String unit;
    private String category;
    
    @Column(name = "is_purchased")
    private Boolean isPurchased = false;
    
    @Enumerated(EnumType.STRING)
    private Priority priority = Priority.MEDIUM;
    
    @Enumerated(EnumType.STRING)
    private Source source = Source.MANUAL;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private Date createdAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;
    
    public enum Priority {
        HIGH, MEDIUM, LOW
    }
    
    public enum Source {
        LOW_STOCK, EXPIRED, MANUAL, RECIPE
    }
}
