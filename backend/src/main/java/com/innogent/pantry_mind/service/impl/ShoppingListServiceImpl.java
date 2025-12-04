package com.innogent.pantry_mind.service.impl;

import com.innogent.pantry_mind.dto.request.CreateShoppingListItemRequestDTO;
import com.innogent.pantry_mind.dto.request.GenerateShoppingListRequestDTO;
import com.innogent.pantry_mind.dto.request.UpdateShoppingListItemRequestDTO;
import com.innogent.pantry_mind.dto.response.GenerateShoppingListResponseDTO;
import com.innogent.pantry_mind.dto.response.ShoppingListItemResponseDTO;
import com.innogent.pantry_mind.dto.response.ShoppingListSummaryResponseDTO;
import com.innogent.pantry_mind.entity.*;
import com.innogent.pantry_mind.mapper.ShoppingListMapper;
import com.innogent.pantry_mind.repository.*;
import com.innogent.pantry_mind.service.ShoppingListService;
import com.innogent.pantry_mind.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShoppingListServiceImpl implements ShoppingListService {
    
    private final ShoppingListRepository shoppingListRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final KitchenRepository kitchenRepository;
    private final UserRepository userRepository;
    private final ShoppingListMapper mapper;
    
    @Override
    public List<ShoppingListItemResponseDTO> getShoppingList(Long kitchenId) {
        List<ShoppingListItem> items = shoppingListRepository.findByKitchenIdOrderByPriorityAscCreatedAtDesc(kitchenId);
        return items.stream().map(mapper::toResponseDTO).collect(Collectors.toList());
    }
    
    @Override
    public ShoppingListSummaryResponseDTO getShoppingListSummary(Long kitchenId) {
        List<ShoppingListItem> items = shoppingListRepository.findByKitchenIdOrderByPriorityAscCreatedAtDesc(kitchenId);
        Kitchen kitchen = kitchenRepository.findById(kitchenId).orElseThrow();
        
        ShoppingListSummaryResponseDTO summary = new ShoppingListSummaryResponseDTO();
        summary.setKitchenId(kitchenId);
        summary.setKitchenName(kitchen.getName());
        summary.setTotalItems(items.size());
        summary.setPurchasedItems((int) items.stream().filter(ShoppingListItem::getIsPurchased).count());
        summary.setPendingItems(items.size() - summary.getPurchasedItems());
        
        summary.setHighPriorityItems(filterAndMap(items, ShoppingListItem.Priority.HIGH, false));
        summary.setMediumPriorityItems(filterAndMap(items, ShoppingListItem.Priority.MEDIUM, false));
        summary.setLowPriorityItems(filterAndMap(items, ShoppingListItem.Priority.LOW, false));
        summary.setPurchasedItemsList(items.stream()
            .filter(ShoppingListItem::getIsPurchased)
            .map(mapper::toResponseDTO).collect(Collectors.toList()));
            
        return summary;
    }
    
    @Override
    @Transactional
    public GenerateShoppingListResponseDTO generateFromLowStock(GenerateShoppingListRequestDTO request) {
        List<InventoryItem> lowStockItems = inventoryItemRepository.findLowStockItems(
            request.getKitchenId(), request.getThreshold());
        Kitchen kitchen = kitchenRepository.findById(request.getKitchenId()).orElseThrow();
        User currentUser = userRepository.findById(SecurityUtil.getCurrentUserId()).orElseThrow();
        
        List<ShoppingListItem> newItems = lowStockItems.stream()
            .map(item -> createShoppingListItem(item, kitchen, currentUser))
            .collect(Collectors.toList());
            
        List<ShoppingListItem> saved = shoppingListRepository.saveAll(newItems);
        
        GenerateShoppingListResponseDTO response = new GenerateShoppingListResponseDTO();
        response.setItemsGenerated(saved.size());
        response.setMessage(String.format("Generated %d items from low stock inventory", saved.size()));
        response.setGeneratedItems(saved.stream().map(mapper::toResponseDTO).collect(Collectors.toList()));
        
        return response;
    }
    
    @Override
    public ShoppingListItemResponseDTO addItem(CreateShoppingListItemRequestDTO request) {
        Kitchen kitchen = kitchenRepository.findById(request.getKitchenId()).orElseThrow();
        User currentUser = userRepository.findById(SecurityUtil.getCurrentUserId()).orElseThrow();
        
        ShoppingListItem item = new ShoppingListItem();
        item.setKitchen(kitchen);
        item.setItemName(request.getItemName());
        item.setQuantity(request.getQuantity());
        item.setUnit(request.getUnit());
        item.setCategory(request.getCategory());
        item.setPriority(request.getPriority());
        item.setSource(request.getSource());
        item.setCreatedBy(currentUser);
        
        ShoppingListItem saved = shoppingListRepository.save(item);
        return mapper.toResponseDTO(saved);
    }
    
    @Override
    public ShoppingListItemResponseDTO updateItem(Long id, UpdateShoppingListItemRequestDTO request) {
        ShoppingListItem item = shoppingListRepository.findById(id).orElseThrow();
        
        item.setItemName(request.getItemName());
        item.setQuantity(request.getQuantity());
        item.setUnit(request.getUnit());
        item.setCategory(request.getCategory());
        item.setPriority(request.getPriority());
        if (request.getIsPurchased() != null) {
            item.setIsPurchased(request.getIsPurchased());
        }
        
        ShoppingListItem saved = shoppingListRepository.save(item);
        return mapper.toResponseDTO(saved);
    }
    
    @Override
    public ShoppingListItemResponseDTO togglePurchased(Long id) {
        ShoppingListItem item = shoppingListRepository.findById(id).orElseThrow();
        item.setIsPurchased(!item.getIsPurchased());
        ShoppingListItem saved = shoppingListRepository.save(item);
        return mapper.toResponseDTO(saved);
    }
    
    @Override
    public void deleteItem(Long id) {
        shoppingListRepository.deleteById(id);
    }
    
    @Override
    @Transactional
    public void clearPurchasedItems(Long kitchenId) {
        shoppingListRepository.deleteByKitchenIdAndIsPurchasedTrue(kitchenId);
    }
    
    private List<ShoppingListItemResponseDTO> filterAndMap(List<ShoppingListItem> items, 
                                                          ShoppingListItem.Priority priority, 
                                                          boolean isPurchased) {
        return items.stream()
            .filter(item -> item.getPriority() == priority && item.getIsPurchased() == isPurchased)
            .map(mapper::toResponseDTO)
            .collect(Collectors.toList());
    }
    
    private ShoppingListItem createShoppingListItem(InventoryItem inventoryItem, Kitchen kitchen, User user) {
        ShoppingListItem item = new ShoppingListItem();
        item.setKitchen(kitchen);
        item.setItemName(inventoryItem.getDescription());
        item.setQuantity(5L);
        item.setCategory(inventoryItem.getInventory().getCategory().getName());
        item.setPriority(inventoryItem.getQuantity() == 0 ? 
            ShoppingListItem.Priority.HIGH : ShoppingListItem.Priority.MEDIUM);
        item.setSource(ShoppingListItem.Source.LOW_STOCK);
        item.setCreatedBy(user);
        return item;
    }
}
