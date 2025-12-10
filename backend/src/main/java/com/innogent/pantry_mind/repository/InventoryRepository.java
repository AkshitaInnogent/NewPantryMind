package com.innogent.pantry_mind.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.innogent.pantry_mind.entity.Inventory;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    List<Inventory> findByKitchenId(Long kitchenId);
    
    Optional<Inventory> findByNormalizedNameAndCategoryIdAndUnitIdAndKitchenId(
        String normalizedName, Long categoryId, Long unitId, Long kitchenId);
    
    @Query("SELECT i.name FROM Inventory i WHERE i.kitchenId = :kitchenId AND i.category.id = :categoryId AND i.unit.id = :unitId")
    List<String> findExistingNamesByKitchenAndCategoryAndUnit(
        @Param("kitchenId") Long kitchenId, 
        @Param("categoryId") Long categoryId, 
        @Param("unitId") Long unitId);

    // for recipe ------ 
    List<Inventory> findByKitchenIdAndTotalQuantityGreaterThan(Long kitchenId, Long quantity);
    
    // Enhanced recipe queries
    @Query("SELECT i FROM Inventory i WHERE i.kitchenId = :kitchenId AND EXISTS (SELECT 1 FROM InventoryItem ii WHERE ii.inventory.id = i.id AND ii.expiryDate BETWEEN CURRENT_DATE AND :expiryDate)")
    List<Inventory> findExpiringInventoryByKitchenId(@Param("kitchenId") Long kitchenId, @Param("expiryDate") java.util.Date expiryDate);
    
    @Query("SELECT i FROM Inventory i WHERE i.kitchenId = :kitchenId AND i.totalQuantity <= i.minStock")
    List<Inventory> findLowStockInventoryByKitchenId(@Param("kitchenId") Long kitchenId);
    
    // Dashboard statistics
    @Query(value = "SELECT COALESCE(SUM((SELECT SUM(price) FROM inventory_item WHERE inventory_id = inventory.id)), 0) FROM inventory", nativeQuery = true)
    Double calculateTotalValue();
    
    @Query(value = "SELECT COUNT(*) FROM inventory WHERE total_quantity <= min_stock", nativeQuery = true)
    Long countLowStockItems();
    
    @Query(value = "SELECT COUNT(DISTINCT inventory.id) FROM inventory JOIN inventory_item ON inventory.id = inventory_item.inventory_id WHERE inventory_item.expiry_date <= CURRENT_DATE + INTERVAL '7 days'", 
    nativeQuery = true)
    Long countExpiringItems();

}