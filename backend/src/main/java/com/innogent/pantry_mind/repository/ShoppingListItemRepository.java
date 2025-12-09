package com.innogent.pantry_mind.repository;

import com.innogent.pantry_mind.entity.ShoppingList;
import com.innogent.pantry_mind.entity.ShoppingListItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShoppingListItemRepository extends JpaRepository<ShoppingListItem, Long> {
    List<ShoppingListItem> findByShoppingList(ShoppingList shoppingList);
    Optional<ShoppingListItem> findByShoppingListAndCanonicalName(ShoppingList shoppingList, String canonicalName);
    List<ShoppingListItem> findByShoppingListId(Long shoppingListId);
}
