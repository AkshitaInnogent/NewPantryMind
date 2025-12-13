package com.innogent.pantry_mind.repository;

import com.innogent.pantry_mind.entity.ConsumptionEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ConsumptionEventRepository extends JpaRepository<ConsumptionEvent, Long> {
    
    @Query("SELECT ce FROM ConsumptionEvent ce WHERE ce.kitchen.id = :kitchenId AND ce.canonicalName = :itemName AND ce.createdAt >= :since")
    List<ConsumptionEvent> findRecentConsumption(@Param("kitchenId") Long kitchenId, 
                                                @Param("itemName") String itemName, 
                                                @Param("since") LocalDateTime since);
    
    @Query("SELECT ce FROM ConsumptionEvent ce WHERE ce.kitchen.id = :kitchenId AND ce.createdAt >= :since ORDER BY ce.createdAt DESC")
    List<ConsumptionEvent> findByKitchenIdAndCreatedAtAfter(@Param("kitchenId") Long kitchenId, @Param("since") LocalDateTime since);
    
    long countByKitchenIdAndReason(Long kitchenId, ConsumptionEvent.EventReason reason);
    
    @Query("SELECT COUNT(ce) FROM ConsumptionEvent ce WHERE ce.kitchen.id = :kitchenId")
    long countByKitchenId(@Param("kitchenId") Long kitchenId);
    
    @Modifying
    @Transactional
    @Query("UPDATE ConsumptionEvent ce SET ce.createdAt = :createdAt WHERE ce.id = :id")
    void updateCreatedAt(@Param("id") Long id, @Param("createdAt") LocalDateTime createdAt);
}
