package com.innogent.pantry_mind.repository;

import com.innogent.pantry_mind.entity.ShoppingList;
import com.innogent.pantry_mind.entity.ShoppingListItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShoppingListItemRepository extends JpaRepository<ShoppingListItem, Long> {
    List<ShoppingListItem> findByShoppingList(ShoppingList shoppingList);
    Optional<ShoppingListItem> findByShoppingListAndCanonicalName(ShoppingList shoppingList, String canonicalName);
    List<ShoppingListItem> findByShoppingListId(Long shoppingListId);
    
    @Query("SELECT sli FROM ShoppingListItem sli " +
           "JOIN sli.shoppingList sl " +
           "WHERE sl.kitchen.id = :kitchenId " +
           "AND sl.listType = :listType " +
           "AND sli.status = 'PURCHASED' " +
           "AND sli.purchasedAt > :cutoffTime")
    List<ShoppingListItem> findRecentlyPurchasedItemsByKitchenAndType(
        @Param("kitchenId") Long kitchenId,
        @Param("listType") ShoppingList.ListType listType,
        @Param("cutoffTime") LocalDateTime cutoffTime
    );
    
    @Modifying
    @Query("DELETE FROM ShoppingListItem sli WHERE sli.status = 'PURCHASED' AND " +
           "((sli.shoppingList.listType = 'DAILY' AND sli.purchasedAt < :dailyCleanup) OR " +
           "(sli.shoppingList.listType = 'WEEKLY' AND sli.purchasedAt < :weeklyCleanup) OR " +
           "(sli.shoppingList.listType = 'MONTHLY' AND sli.purchasedAt < :monthlyCleanup))")
    void deletePurchasedItemsByTimeAndType(
        @Param("dailyCleanup") LocalDateTime dailyCleanupTime,
        @Param("weeklyCleanup") LocalDateTime weeklyCleanupTime,
        @Param("monthlyCleanup") LocalDateTime monthlyCleanupTime
    );
}
