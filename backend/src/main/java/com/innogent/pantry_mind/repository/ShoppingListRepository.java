package com.innogent.pantry_mind.repository;

import com.innogent.pantry_mind.entity.ShoppingList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShoppingListRepository extends JpaRepository<ShoppingList, Long> {
    
    @Query("SELECT sl FROM ShoppingList sl WHERE sl.kitchen.id = :kitchenId ORDER BY sl.createdAt DESC")
    List<ShoppingList> findByKitchenIdOrderByCreatedAtDesc(@Param("kitchenId") Long kitchenId);
    
    @Query("SELECT sl FROM ShoppingList sl WHERE sl.kitchen.id = :kitchenId AND sl.status = :status")
    List<ShoppingList> findByKitchenIdAndStatus(@Param("kitchenId") Long kitchenId, @Param("status") ShoppingList.ListStatus status);

    boolean existsByKitchenIdAndListType(Long kitchenId, ShoppingList.ListType listType);
    List<ShoppingList> findByKitchenIdOrderByListType(Long kitchenId);

    Optional<ShoppingList> findByKitchenIdAndListType(Long kitchenId, ShoppingList.ListType listType);


}
