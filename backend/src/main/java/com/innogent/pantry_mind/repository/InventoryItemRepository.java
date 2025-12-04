package com.innogent.pantry_mind.repository;

import com.innogent.pantry_mind.entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
    @Query("SELECT i FROM InventoryItem i LEFT JOIN FETCH i.createdByUser WHERE i.inventory.id = :inventoryId")
    List<InventoryItem> findByInventoryId(@Param("inventoryId") Long inventoryId);
    
    @Query("SELECT SUM(i.quantity) FROM InventoryItem i WHERE i.inventory.id = :inventoryId")
    Long sumQuantityByInventoryId(@Param("inventoryId") Long inventoryId);
    
    @Query("SELECT MIN(i.expiryDate) FROM InventoryItem i WHERE i.inventory.id = :inventoryId AND i.expiryDate >= CURRENT_DATE")
    Date findEarliestExpiryByInventoryId(@Param("inventoryId") Long inventoryId);
    
    @Query("SELECT COUNT(i) FROM InventoryItem i WHERE i.inventory.id = :inventoryId")
    Long countByInventoryId(@Param("inventoryId") Long inventoryId);
    
    @Query("SELECT i FROM InventoryItem i WHERE i.inventory.kitchenId = :kitchenId AND i.quantity <= :threshold")
    List<InventoryItem> findLowStockItems(@Param("kitchenId") Long kitchenId, @Param("threshold") Integer threshold);
}
