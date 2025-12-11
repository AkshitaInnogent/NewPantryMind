package com.innogent.pantry_mind.repository;

import com.innogent.pantry_mind.entity.UsageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UsageLogRepository extends JpaRepository<UsageLog, Long> {
    
    @Query("SELECT TO_CHAR(u.usedAt, 'Mon') as month, COUNT(u) as count FROM UsageLog u " +
           "WHERE u.kitchenId = :kitchenId AND u.usedAt >= :since " +
           "GROUP BY TO_CHAR(u.usedAt, 'Mon') " +
           "ORDER BY MIN(u.usedAt)")
    List<Object[]> findMonthlyConsumptionData(
        @Param("kitchenId") Long kitchenId, 
        @Param("since") LocalDateTime since
    );
    
    long countByKitchenIdAndUsedAtAfter(Long kitchenId, LocalDateTime since);
    
    List<UsageLog> findTop5ByKitchenIdOrderByUsedAtDesc(Long kitchenId);
    
    List<UsageLog> findFirstByKitchenIdOrderByUsedAtAsc(Long kitchenId);
    
    List<UsageLog> findByKitchenId(Long kitchenId);
    
    List<UsageLog> findByInventoryItemIdOrderByUsedAtDesc(Long inventoryItemId);

    List<UsageLog> findByMealLogId(Long mealLogId);

    List<UsageLog> findByKitchenIdAndUsedAtBetween(Long kitchenId, LocalDateTime start, LocalDateTime end);
    
    List<UsageLog> findByUserIdAndUsedAtBetween(Long userId, LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT u FROM UsageLog u WHERE u.kitchenId = :kitchenId AND u.usageType = :usageType ORDER BY u.usedAt DESC")
    List<UsageLog> findByKitchenIdAndUsageType(@Param("kitchenId") Long kitchenId, @Param("usageType") UsageLog.UsageType usageType);
    
    @Query("SELECT inv.name, COUNT(u) FROM UsageLog u JOIN InventoryItem ii ON u.inventoryItemId = ii.id JOIN Inventory inv ON ii.inventory.id = inv.id WHERE u.kitchenId = :kitchenId GROUP BY inv.name ORDER BY COUNT(u) DESC")
    List<Object[]> findTopUsedItemsByKitchen(@Param("kitchenId") Long kitchenId);
    
    @Query("SELECT u FROM UsageLog u WHERE u.kitchenId = :kitchenId")
    List<UsageLog> findAllByKitchenId(@Param("kitchenId") Long kitchenId);
}