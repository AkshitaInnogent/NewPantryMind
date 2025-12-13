package com.innogent.pantry_mind.repository;

import com.innogent.pantry_mind.entity.PurchaseLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
@Repository
public interface PurchaseLogRepository extends JpaRepository<PurchaseLog, Long> {

    @Query("SELECT FUNCTION('TO_CHAR', p.purchasedAt, 'Mon') as month, " +
            "SUM(p.pricePaid) as total " +
            "FROM PurchaseLog p " +
            "WHERE p.kitchenId = :kitchenId AND p.purchasedAt >= :since " +
            "GROUP BY FUNCTION('TO_CHAR', p.purchasedAt, 'Mon'), " +
            "FUNCTION('TO_CHAR', p.purchasedAt, 'MM') " +
            "ORDER BY MIN(p.purchasedAt)")
    List<Object[]> findMonthlyPurchaseDataWithMonthNames(
            @Param("kitchenId") Long kitchenId,
            @Param("since") LocalDateTime since
    );

    @Query("SELECT p.purchaseSource, SUM(p.pricePaid) as total " +
            "FROM PurchaseLog p " +
            "WHERE p.kitchenId = :kitchenId AND p.purchasedAt >= :since " +
            "GROUP BY p.purchaseSource")
    List<Object[]> findSpendingBySource(
            @Param("kitchenId") Long kitchenId,
            @Param("since") LocalDateTime since
    );

    @Query("SELECT COUNT(p) FROM PurchaseLog p WHERE p.kitchenId = :kitchenId AND p.purchasedAt >= :since")
    long countByKitchenIdAndPurchasedAtAfter(
            @Param("kitchenId") Long kitchenId,
            @Param("since") LocalDateTime since
    );

    @Query("SELECT p FROM PurchaseLog p WHERE p.kitchenId = :kitchenId ORDER BY p.purchasedAt DESC")
    List<PurchaseLog> findTop5ByKitchenIdOrderByPurchasedAtDesc(
            @Param("kitchenId") Long kitchenId
    );

    @Query("SELECT p FROM PurchaseLog p WHERE p.kitchenId = :kitchenId ORDER BY p.purchasedAt ASC")
    List<PurchaseLog> findFirstByKitchenIdOrderByPurchasedAtAsc(
            @Param("kitchenId") Long kitchenId
    );
    
    @Query("SELECT COALESCE(SUM(p.pricePaid), 0) FROM PurchaseLog p WHERE p.kitchenId = :kitchenId AND p.purchasedAt >= :startDate")
    BigDecimal calculateTotalSpentByPeriod(@Param("kitchenId") Long kitchenId, @Param("startDate") LocalDateTime startDate);
}