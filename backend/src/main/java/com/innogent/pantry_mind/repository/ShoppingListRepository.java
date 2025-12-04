package com.innogent.pantry_mind.repository;

import com.innogent.pantry_mind.entity.ShoppingListItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ShoppingListRepository extends JpaRepository<ShoppingListItem, Long> {
    
    List<ShoppingListItem> findByKitchenIdOrderByPriorityAscCreatedAtDesc(Long kitchenId);
    
    @Query("SELECT s FROM ShoppingListItem s WHERE s.kitchen.id = :kitchenId AND s.isPurchased = false")
    List<ShoppingListItem> findActiveItemsByKitchen(@Param("kitchenId") Long kitchenId);
    
    @Modifying
    @Query("DELETE FROM ShoppingListItem s WHERE s.kitchen.id = :kitchenId AND s.isPurchased = true")
    void deleteByKitchenIdAndIsPurchasedTrue(@Param("kitchenId") Long kitchenId);
    
    List<ShoppingListItem> findByKitchenIdAndIsPurchased(Long kitchenId, Boolean isPurchased);
    
    @Query("SELECT COUNT(s) FROM ShoppingListItem s WHERE s.kitchen.id = :kitchenId AND s.isPurchased = false")
    Long countPendingItemsByKitchen(@Param("kitchenId") Long kitchenId);
}
