package com.innogent.pantry_mind.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "meal_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MealLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "kitchen_id", nullable = false)
    private Long kitchenId;
    
    @Column(name = "cooked_by", nullable = false)
    private Long cookedBy;
    
    @Column(name = "meal_name", nullable = false)
    private String mealName;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "meal_type", nullable = false)
    private MealType mealType;
    
    @Column(name = "servings", nullable = false)
    private Integer servings;
    
    @Column(name = "ingredients_used", columnDefinition = "TEXT")
    private String ingredientsUsed; // JSON array of ingredients
    
    @Column(name = "recipe_data", columnDefinition = "TEXT")
    private String recipeData; // JSON recipe details
    
    @Column(name = "cooking_time_minutes")
    private Integer cookingTimeMinutes;
    
    @Column(name = "rating")
    private Integer rating; // 1-5 stars
    
    @CreationTimestamp
    @Column(name = "cooked_at")
    private LocalDateTime cookedAt;
    
    public enum MealType {
        BREAKFAST, LUNCH, DINNER
    }
}