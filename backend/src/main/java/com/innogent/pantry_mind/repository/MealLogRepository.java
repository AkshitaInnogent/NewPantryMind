package com.innogent.pantry_mind.repository;

import com.innogent.pantry_mind.entity.MealLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MealLogRepository extends JpaRepository<MealLog, Long> {
    
    List<MealLog> findByKitchenIdOrderByCookedAtDesc(Long kitchenId);
    
    List<MealLog> findByCookedByOrderByCookedAtDesc(Long cookedBy);
    
    List<MealLog> findByKitchenIdAndCookedAtBetween(Long kitchenId, LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT m FROM MealLog m WHERE m.kitchenId = :kitchenId AND m.mealType = :mealType ORDER BY m.cookedAt DESC")
    List<MealLog> findByKitchenIdAndMealType(@Param("kitchenId") Long kitchenId, @Param("mealType") MealLog.MealType mealType);
    
    @Query("SELECT COUNT(m) FROM MealLog m WHERE m.kitchenId = :kitchenId AND m.cookedAt >= :startDate")
    Long countMealsByKitchenSince(@Param("kitchenId") Long kitchenId, @Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT m.mealType, COUNT(m) FROM MealLog m WHERE m.kitchenId = :kitchenId GROUP BY m.mealType")
    List<Object[]> findMealTypeDistribution(@Param("kitchenId") Long kitchenId);
}