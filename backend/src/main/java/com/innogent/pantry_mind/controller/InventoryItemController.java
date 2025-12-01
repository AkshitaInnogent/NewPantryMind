package com.innogent.pantry_mind.controller;

import com.innogent.pantry_mind.dto.request.CreateInventoryItemRequestDTO;
import com.innogent.pantry_mind.dto.response.InventoryItemResponseDTO;
import com.innogent.pantry_mind.dto.request.UpdateInventoryItemRequestDTO;
import com.innogent.pantry_mind.service.impl.InventoryServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory Items", description = "Inventory item management APIs")
public class InventoryItemController {

    private final InventoryServiceImpl inventoryItemService;

    @PostMapping
    @Operation(summary = "Create a new inventory item")
    public ResponseEntity<InventoryItemResponseDTO> createItem(@Valid @RequestBody CreateInventoryItemRequestDTO dto) {
        return ResponseEntity.ok(inventoryItemService.addInventoryItem(dto));
    }

    @GetMapping
    @Operation(summary = "Get all inventory items")
    public ResponseEntity<List<InventoryItemResponseDTO>> getAllItems(@RequestParam(required = false) Long kitchenId) {
        if (kitchenId != null) {
            return ResponseEntity.ok(inventoryItemService.getInventoryItemsByKitchen(kitchenId));
        }
        return ResponseEntity.ok(inventoryItemService.getAllInventoryItems());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get inventory item by ID")
    public ResponseEntity<InventoryItemResponseDTO> getItemById(@PathVariable Long id) {
        InventoryItemResponseDTO item = inventoryItemService.getInventoryItemById(id);
        return item != null ? ResponseEntity.ok(item) : ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update inventory item")
    public ResponseEntity<InventoryItemResponseDTO> updateItem(@PathVariable Long id, @Valid @RequestBody UpdateInventoryItemRequestDTO dto) {
        return ResponseEntity.ok(inventoryItemService.updateInventoryItem(dto, id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete inventory item")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        inventoryItemService.deleteInventoryItem(id);
        return ResponseEntity.noContent().build();
    }
}
