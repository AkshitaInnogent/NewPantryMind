package com.innogent.pantry_mind.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "user_preferences")
public class UserPreferences {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;
    
    @Column(name = "dietary_restrictions", columnDefinition = "TEXT")
    private String dietaryRestrictions; // JSON array as string
    
    @Column(name = "cuisine_preferences", columnDefinition = "TEXT")
    private String cuisinePreferences; // JSON array as string
    
    @Enumerated(EnumType.STRING)
    @Column(name = "skill_level")
    private SkillLevel skillLevel = SkillLevel.INTERMEDIATE;
    
    @Column(name = "max_cooking_time")
    private Integer maxCookingTime = 45;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "spice_level")
    private SpiceLevel spiceLevel = SpiceLevel.MEDIUM;
    
    @Column(name = "avoid_ingredients", columnDefinition = "TEXT")
    private String avoidIngredients; // JSON array as string
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum SkillLevel {
        BEGINNER, INTERMEDIATE, ADVANCED
    }
    
    public enum SpiceLevel {
        MILD, MEDIUM, SPICY, EXTRA_SPICY
    }
}