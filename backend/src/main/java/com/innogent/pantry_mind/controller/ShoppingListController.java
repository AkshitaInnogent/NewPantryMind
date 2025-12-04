package com.innogent.pantry_mind.controller;

import com.innogent.pantry_mind.dto.request.CreateShoppingListItemRequestDTO;
import com.innogent.pantry_mind.dto.request.GenerateShoppingListRequestDTO;
import com.innogent.pantry_mind.dto.request.UpdateShoppingListItemRequestDTO;
import com.innogent.pantry_mind.dto.response.GenerateShoppingListResponseDTO;
import com.innogent.pantry_mind.dto.response.ShoppingListItemResponseDTO;
import com.innogent.pantry_mind.dto.response.ShoppingListSummaryResponseDTO;
import com.innogent.pantry_mind.service.ShoppingListService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shopping-list")
@RequiredArgsConstructor
@Tag(name = "Shopping List", description = "Shopping list management APIs")
public class ShoppingListController {
    
    private final ShoppingListService shoppingListService;
    
    @GetMapping
    @Operation(summary = "Get shopping list items")
    public ResponseEntity<List<ShoppingListItemResponseDTO>> getShoppingList(@RequestParam Long kitchenId) {
        return ResponseEntity.ok(shoppingListService.getShoppingList(kitchenId));
    }
    
    @GetMapping("/summary")
    @Operation(summary = "Get shopping list summary with grouped items")
    public ResponseEntity<ShoppingListSummaryResponseDTO> getShoppingListSummary(@RequestParam Long kitchenId) {
        return ResponseEntity.ok(shoppingListService.getShoppingListSummary(kitchenId));
    }
    
    @PostMapping("/generate-from-low-stock")
    @Operation(summary = "Generate shopping list from low stock items")
    public ResponseEntity<GenerateShoppingListResponseDTO> generateFromLowStock(
            @Valid @RequestBody GenerateShoppingListRequestDTO request) {
        return ResponseEntity.ok(shoppingListService.generateFromLowStock(request));
    }
    
    @PostMapping
    @Operation(summary = "Add item to shopping list")
    public ResponseEntity<ShoppingListItemResponseDTO> addItem(@Valid @RequestBody CreateShoppingListItemRequestDTO request) {
        return ResponseEntity.ok(shoppingListService.addItem(request));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update shopping list item")
    public ResponseEntity<ShoppingListItemResponseDTO> updateItem(
            @PathVariable Long id, 
            @Valid @RequestBody UpdateShoppingListItemRequestDTO request) {
        return ResponseEntity.ok(shoppingListService.updateItem(id, request));
    }
    
    @PutMapping("/{id}/toggle-purchased")
    @Operation(summary = "Toggle item purchased status")
    public ResponseEntity<ShoppingListItemResponseDTO> togglePurchased(@PathVariable Long id) {
        return ResponseEntity.ok(shoppingListService.togglePurchased(id));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete shopping list item")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        shoppingListService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }
    
    @DeleteMapping("/clear-purchased")
    @Operation(summary = "Clear all purchased items")
    public ResponseEntity<Void> clearPurchasedItems(@RequestParam Long kitchenId) {
        shoppingListService.clearPurchasedItems(kitchenId);
        return ResponseEntity.noContent().build();
    }
}
