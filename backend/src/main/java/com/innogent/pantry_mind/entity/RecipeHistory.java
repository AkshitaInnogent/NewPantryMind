package com.innogent.pantry_mind.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "recipe_history")
public class RecipeHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    
    @Column(name = "recipe_name")
    private String recipeName;
    
    @Column(name = "recipe_data", columnDefinition = "TEXT")
    private String recipeData; // JSON as string
    
    @Column(name = "rating")
    private Integer rating; // 1-5 stars
    
    @Column(name = "cooking_time_actual")
    private Integer cookingTimeActual;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "recipe_type")
    private RecipeType recipeType;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    public enum RecipeType {
        REGULAR, EXPIRY_BASED, QUICK, WASTAGE_PREVENTION
    }
}