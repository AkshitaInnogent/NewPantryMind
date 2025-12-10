package com.innogent.pantry_mind.repository;

import com.innogent.pantry_mind.entity.RecipeHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RecipeHistoryRepository extends JpaRepository<RecipeHistory, Long> {
    List<RecipeHistory> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    @Query("SELECT rh FROM RecipeHistory rh WHERE rh.user.id = :userId AND rh.rating >= 4 ORDER BY rh.createdAt DESC")
    List<RecipeHistory> findHighRatedRecipesByUserId(Long userId);
}