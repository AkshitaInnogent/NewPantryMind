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
    @Query("""
        SELECT DISTINCT i FROM Inventory i 
        JOIN i.items ii 
        WHERE i.kitchenId = :kitchenId 
        AND ii.expiryDate BETWEEN CURRENT_DATE AND :expiryDate 
        AND ii.currentQuantity > 0 
        AND ii.isActive = true
        """)
    List<Inventory> findExpiringInventoryByKitchenId(@Param("kitchenId") Long kitchenId, @Param("expiryDate") java.util.Date expiryDate);
    
    @Query("SELECT i FROM Inventory i WHERE i.kitchenId = :kitchenId AND i.totalQuantity <= i.minStock")
    List<Inventory> findLowStockInventoryByKitchenId(@Param("kitchenId") Long kitchenId);
    
    // Dashboard statistics
    @Query(value = "SELECT COALESCE(SUM((SELECT SUM(price) FROM inventory_item WHERE inventory_id = inventory.id)), 0) FROM inventory", nativeQuery = true)
    Double calculateTotalValue();
    
    @Query(value = "SELECT COUNT(*) FROM inventory WHERE total_quantity <= COALESCE(min_stock, 5)", nativeQuery = true)
    Long countLowStockItems();
    
    @Query(value = "SELECT COUNT(DISTINCT inventory.id) FROM inventory JOIN inventory_item ON inventory.id = inventory_item.inventory_id WHERE inventory_item.expiry_date <= CURRENT_DATE + INTERVAL '7 days'", nativeQuery = true)
    Long countExpiringItems();

    // Low stock items query - fixed to use minStock properly
    @Query("SELECT i FROM Inventory i WHERE i.kitchenId = :kitchenId AND (i.totalQuantity IS NULL OR i.totalQuantity <= COALESCE(i.minStock, 5))")
    List<Inventory> findLowStockByKitchenId(@Param("kitchenId") Long kitchenId);

    @Query("SELECT i FROM Inventory i WHERE i.name = :name AND i.kitchenId = :kitchenId")
    Inventory findByNameAndKitchenId(@Param("name") String name, @Param("kitchenId") Long kitchenId);

    @Query("SELECT i FROM Inventory i WHERE i.kitchenId = :kitchenId AND i.totalQuantity <= COALESCE(i.minStock, 5)")
    List<Inventory> findLowStockItems(@Param("kitchenId") Long kitchenId);
    
    @Query("SELECT c.name, COUNT(i), COALESCE(SUM((SELECT SUM(ii.price) FROM InventoryItem ii WHERE ii.inventory.id = i.id)), 0) " +
           "FROM Inventory i JOIN i.category c " +
           "WHERE i.kitchenId = :kitchenId " +
           "GROUP BY c.name " +
           "ORDER BY COUNT(i) DESC")
    List<Object[]> findCategoryBreakdownByKitchen(@Param("kitchenId") Long kitchenId);
}
