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
    
    @Query("SELECT FUNCTION('MONTHNAME', w.wastedAt) as month, COUNT(w) as count FROM WasteLog w " +
           "WHERE w.kitchenId = :kitchenId AND w.wastedAt >= :since " +
           "GROUP BY FUNCTION('MONTH', w.wastedAt), FUNCTION('MONTHNAME', w.wastedAt) " +
           "ORDER BY FUNCTION('MONTH', w.wastedAt)")
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
    
    @Query("SELECT COUNT(w) FROM WasteLog w WHERE w.kitchenId = :kitchenId AND w.wasteReason = 'EXPIRED'")
    Long countExpiredItemsByKitchen(@Param("kitchenId") Long kitchenId);
    
    @Query("SELECT COALESCE(SUM(w.estimatedValue), 0) FROM WasteLog w WHERE w.kitchenId = :kitchenId AND w.wasteReason = 'EXPIRED'")
    BigDecimal calculateExpiredWasteValueByKitchen(@Param("kitchenId") Long kitchenId);
    
    @Query("SELECT COALESCE(SUM(w.estimatedValue), 0) FROM WasteLog w WHERE w.kitchenId = :kitchenId AND w.wastedAt >= :startDate")
    BigDecimal calculateWasteValueByKitchenAndPeriod(@Param("kitchenId") Long kitchenId, @Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT DATE_TRUNC('month', w.wastedAt) as month, SUM(w.estimatedValue) as waste, COUNT(w) as count " +
           "FROM WasteLog w WHERE w.kitchenId = :kitchenId " +
           "GROUP BY DATE_TRUNC('month', w.wastedAt) " +
           "ORDER BY month DESC LIMIT 6")
    List<Object[]> findMonthlyWasteStats(@Param("kitchenId") Long kitchenId);
    
    @Query("SELECT COUNT(*) FROM WasteLog w WHERE w.kitchenId = :kitchenId AND DATE(w.wastedAt) = :date")
    Long countWasteByDate(@Param("kitchenId") Long kitchenId, @Param("date") LocalDateTime date);
    
    long countByKitchenId(Long kitchenId);
    
    long countByKitchenIdAndWasteReason(Long kitchenId, WasteLog.WasteReason wasteReason);
}