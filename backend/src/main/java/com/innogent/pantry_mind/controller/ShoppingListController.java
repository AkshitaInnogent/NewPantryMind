package com.innogent.pantry_mind.controller;

import com.innogent.pantry_mind.dto.request.AddShoppingListItemRequestDTO;
import com.innogent.pantry_mind.dto.request.AddToInventoryRequest;
import com.innogent.pantry_mind.dto.request.UpdateShoppingListItemRequestDTO;
import com.innogent.pantry_mind.dto.response.ShoppingListResponseDTO;
import com.innogent.pantry_mind.dto.response.ShoppingListItemResponseDTO;
import com.innogent.pantry_mind.dto.response.ShoppingSuggestionDTO;
import com.innogent.pantry_mind.service.ShoppingListService;
import com.innogent.pantry_mind.repository.UserRepository;
import com.innogent.pantry_mind.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shopping-lists")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ShoppingListController {

    private final ShoppingListService shoppingListService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<ShoppingListResponseDTO>> getShoppingListsByKitchen(@RequestParam Long kitchenId) {
        List<ShoppingListResponseDTO> lists = shoppingListService.getOrCreateFixedLists(kitchenId);
        return ResponseEntity.ok(lists);
    }

    @GetMapping("/kitchen/{kitchenId}")
    public ResponseEntity<List<ShoppingListResponseDTO>> getOrCreateFixedLists(@PathVariable Long kitchenId) {
        List<ShoppingListResponseDTO> lists = shoppingListService.getOrCreateFixedLists(kitchenId);
        return ResponseEntity.ok(lists);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShoppingListResponseDTO> getShoppingListById(@PathVariable Long id) {
        ShoppingListResponseDTO list = shoppingListService.getShoppingListById(id);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/{listId}/items")
    public ResponseEntity<ShoppingListItemResponseDTO> addItemToList(
            @PathVariable Long listId,
            @RequestBody AddShoppingListItemRequestDTO dto,
            @RequestParam Long userId) {
        dto.setShoppingListId(listId);
        ShoppingListItemResponseDTO item = shoppingListService.addItemToList(dto, userId);
        return ResponseEntity.ok(item);
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<ShoppingListItemResponseDTO> updateItemQuantity(
            @PathVariable Long itemId,
            @RequestBody UpdateShoppingListItemRequestDTO dto) {
        ShoppingListItemResponseDTO item = shoppingListService.updateItemQuantity(itemId, dto);
        return ResponseEntity.ok(item);
    }

    @PutMapping("/items/{itemId}/status")
    public ResponseEntity<ShoppingListItemResponseDTO> updateItemStatus(
            @PathVariable Long itemId,
            @RequestParam String status) {
        ShoppingListItemResponseDTO item = shoppingListService.updateItemStatus(itemId, status);
        return ResponseEntity.ok(item);
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Void> deleteShoppingListItem(@PathVariable Long itemId) {
        shoppingListService.deleteShoppingListItem(itemId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{listId}/ai-suggestions")
    public ResponseEntity<List<ShoppingSuggestionDTO>> getAISuggestions(
            @PathVariable Long listId,
            @RequestParam Long kitchenId,
            @RequestParam Long userId) {
        List<ShoppingSuggestionDTO> suggestions = shoppingListService.getAISuggestions(listId, kitchenId, userId);
        return ResponseEntity.ok(suggestions);
    }

    @PostMapping("/{listId}/ai-suggestions")
    public ResponseEntity<List<ShoppingSuggestionDTO>> generateAISuggestionsPost(
            @PathVariable Long listId,
            @RequestParam Long kitchenId) {
        Long userId = getCurrentUserId();
        List<ShoppingSuggestionDTO> suggestions = shoppingListService.getAISuggestions(listId, kitchenId, userId);
        System.out.println("Controller: Returning " + suggestions.size() + " suggestions for review");
        return ResponseEntity.ok(suggestions);
    }

    @PostMapping("/{listId}/add-suggestions")
    public ResponseEntity<List<ShoppingListItemResponseDTO>> addSelectedSuggestions(
            @PathVariable Long listId,
            @RequestBody List<ShoppingSuggestionDTO> selectedSuggestions) {
        Long userId = getCurrentUserId();
        List<ShoppingListItemResponseDTO> added = shoppingListService.addSuggestionsToList(listId, selectedSuggestions, userId);
        return ResponseEntity.ok(added);
    }

    @PostMapping("/{listId}/generate-ai-suggestions")
    public ResponseEntity<List<ShoppingListItemResponseDTO>> generateAISuggestions(
            @PathVariable Long listId,
            @RequestParam Long kitchenId,
            @RequestParam Long userId) {
        List<ShoppingListItemResponseDTO> suggestions = shoppingListService.generateAISuggestions(listId, kitchenId, userId);
        return ResponseEntity.ok(suggestions);
    }

    @GetMapping("/low-stock/{kitchenId}")
    public ResponseEntity<List<Map<String, Object>>> getLowStockItems(@PathVariable Long kitchenId) {
        List<Map<String, Object>> items = shoppingListService.getLowStockItems(kitchenId);
        return ResponseEntity.ok(items);
    }

    @PostMapping("/items/{itemId}/purchase")
    public ResponseEntity<Map<String, Object>> markAsPurchased(
            @PathVariable Long itemId,
            @RequestParam(required = false) String actualQuantity,
            @RequestParam Long userId) {
        Map<String, Object> result = shoppingListService.markAsPurchasedAndUpdateInventory(itemId, actualQuantity, userId);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{listId}/items/{itemId}/add-to-inventory")
    public ResponseEntity<Void> addItemToInventory(
            @PathVariable Long listId,
            @PathVariable Long itemId,
            @RequestBody AddToInventoryRequest request) {
        shoppingListService.addItemToInventory(listId, itemId, request);
        return ResponseEntity.ok().build();
    }

    // New endpoints for purchased items management
    @PostMapping("/items/{itemId}/mark-purchased")
    public ResponseEntity<ShoppingListItemResponseDTO> markItemAsPurchased(@PathVariable Long itemId) {
        ShoppingListItemResponseDTO item = shoppingListService.markItemAsPurchased(itemId);
        return ResponseEntity.ok(item);
    }

    @PostMapping("/items/mark-purchased-batch")
    public ResponseEntity<List<ShoppingListItemResponseDTO>> markMultipleItemsAsPurchased(
            @RequestBody List<Long> itemIds) {
        List<ShoppingListItemResponseDTO> items = shoppingListService.markMultipleItemsAsPurchased(itemIds);
        return ResponseEntity.ok(items);
    }

    @PostMapping("/cleanup-purchased")
    public ResponseEntity<Void> cleanupPurchasedItems() {
        shoppingListService.cleanupPurchasedItems();
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{listId}/generate-suggestions")
    public ResponseEntity<List<ShoppingListItemResponseDTO>> generateSuggestions(
            @PathVariable Long listId,
            @RequestParam Long kitchenId) {
        Long userId = getCurrentUserId();
        List<ShoppingListItemResponseDTO> suggestions = shoppingListService.generateAISuggestions(listId, kitchenId, userId);
        return ResponseEntity.ok(suggestions);
    }

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
