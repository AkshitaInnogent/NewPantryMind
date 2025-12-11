package com.innogent.pantry_mind.repository;

import com.innogent.pantry_mind.entity.WasteLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WasteLogRepository extends JpaRepository<WasteLog, Long> {
    
    @Query("SELECT TO_CHAR(w.wastedAt, 'Mon') as month, COUNT(w) as count FROM WasteLog w " +
           "WHERE w.kitchenId = :kitchenId AND w.wastedAt >= :since " +
           "GROUP BY TO_CHAR(w.wastedAt, 'Mon') " +
           "ORDER BY MIN(w.wastedAt)")
    List<Object[]> findMonthlyWasteData(
        @Param("kitchenId") Long kitchenId, 
        @Param("since") LocalDateTime since
    );
    
    long countByKitchenIdAndWastedAtAfter(Long kitchenId, LocalDateTime since);
    
    List<WasteLog> findTop5ByKitchenIdOrderByWastedAtDesc(Long kitchenId);
    
    List<WasteLog> findFirstByKitchenIdOrderByWastedAtAsc(Long kitchenId);
    
    List<WasteLog> findByKitchenId(Long kitchenId);
    
    List<WasteLog> findByInventoryItemIdOrderByWastedAtDesc(Long inventoryItemId);
    
    List<WasteLog> findByKitchenIdAndWastedAtBetween(Long kitchenId, LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT w FROM WasteLog w WHERE w.kitchenId = :kitchenId AND w.wasteReason = :reason ORDER BY w.wastedAt DESC")
    List<WasteLog> findByKitchenIdAndWasteReason(@Param("kitchenId") Long kitchenId, @Param("reason") WasteLog.WasteReason reason);
    
    @Query("SELECT SUM(w.estimatedValue) FROM WasteLog w WHERE w.kitchenId = :kitchenId AND w.wastedAt >= :startDate")
    BigDecimal calculateTotalWasteValueSince(@Param("kitchenId") Long kitchenId, @Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT w FROM WasteLog w WHERE w.kitchenId = :kitchenId")
    List<WasteLog> findAllByKitchenId(@Param("kitchenId") Long kitchenId);
}