package com.innogent.pantry_mind.controller;

import com.innogent.pantry_mind.dto.request.ConsumeItemsRequestDTO;
import com.innogent.pantry_mind.dto.request.CreateInventoryItemRequestDTO;
import com.innogent.pantry_mind.dto.request.UpdateInventoryAlertsRequestDTO;
import com.innogent.pantry_mind.dto.request.UpdateInventoryItemRequestDTO;
import com.innogent.pantry_mind.dto.response.ConsumeItemsResponseDTO;
import com.innogent.pantry_mind.dto.response.InventoryConsumptionInfoDTO;
import com.innogent.pantry_mind.dto.response.InventoryItemResponseDTO;
import com.innogent.pantry_mind.dto.response.InventoryResponseDTO;
import com.innogent.pantry_mind.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Inventory", description = "Inventory management APIs")
public class InventoryItemController {

    private final InventoryService inventoryService;

    @PostMapping
    @Operation(summary = "Add a new inventory item")
    public ResponseEntity<InventoryItemResponseDTO> addItem(@Valid @RequestBody CreateInventoryItemRequestDTO dto) {
        try {
            log.info("Adding inventory item: {}", dto);
            return ResponseEntity.ok(inventoryService.addInventoryItem(dto));
        } catch (IllegalArgumentException e) {
            log.error("Validation error: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error adding inventory item: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping
    @Operation(summary = "Get all grouped inventory products")
    public ResponseEntity<List<InventoryResponseDTO>> getAllInventory(@RequestParam(required = false) Long kitchenId) {
        if (kitchenId != null) {
            return ResponseEntity.ok(inventoryService.getInventoryItemsByKitchen(kitchenId));
        }
        return ResponseEntity.ok(inventoryService.getAllInventoryItems());
    }



    @PostMapping("/consume")
    @Operation(summary = "Consume inventory items")
    public ResponseEntity<ConsumeItemsResponseDTO> consumeItems(@Valid @RequestBody ConsumeItemsRequestDTO dto) {
        ConsumeItemsResponseDTO response = inventoryService.consumeItems(dto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get inventory details with all individual items")
    public ResponseEntity<InventoryResponseDTO> getInventoryById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(inventoryService.getInventoryItemById(id));
        } catch (Exception e) {
            throw new RuntimeException("Invalid inventory ID: " + id + ". Use format /api/inventory/{id}");
        }
    }

    @PutMapping("/items/{id}")
    @Operation(summary = "Update individual inventory item")
    public ResponseEntity<InventoryItemResponseDTO> updateItem(@PathVariable Long id, @Valid @RequestBody UpdateInventoryItemRequestDTO dto) {
        return ResponseEntity.ok(inventoryService.updateInventoryItem(id, dto));
    }

    @DeleteMapping("/items/{id}")
    @Operation(summary = "Delete individual inventory item")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        inventoryService.deleteInventoryItem(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/alerts")
    @Operation(summary = "Update inventory alert settings")
    public ResponseEntity<InventoryResponseDTO> updateAlerts(@PathVariable Long id, @RequestBody UpdateInventoryAlertsRequestDTO dto) {
        return ResponseEntity.ok(inventoryService.updateInventoryAlerts(id, dto));
    }

    @GetMapping("/items/{id}")
    @Operation(summary = "Get individual inventory item by ID")
    public ResponseEntity<InventoryItemResponseDTO> getItemById(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.getInventoryItemByItemId(id));
    }
    
    @GetMapping("/expired")
    @Operation(summary = "Get expired inventory items for kitchen")
    public ResponseEntity<List<InventoryItemResponseDTO>> getExpiredItems(@RequestParam Long kitchenId) {
        return ResponseEntity.ok(inventoryService.getExpiredItems(kitchenId));
    }
    
    @GetMapping("/{id}/consumption-info")
    @Operation(summary = "Get consumption info for inventory item")
    public ResponseEntity<InventoryConsumptionInfoDTO> getConsumptionInfo(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.getConsumptionInfo(id));
    }
    

}
