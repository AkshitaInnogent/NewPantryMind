package com.innogent.pantry_mind.service.impl;

import com.innogent.pantry_mind.dto.request.CreateShoppingListRequestDTO;
import com.innogent.pantry_mind.dto.request.AddShoppingListItemRequestDTO;
import com.innogent.pantry_mind.dto.request.AddToInventoryRequest;
import com.innogent.pantry_mind.dto.request.UpdateShoppingListItemRequestDTO;
import com.innogent.pantry_mind.dto.response.ShoppingListResponseDTO;
import com.innogent.pantry_mind.dto.response.ShoppingListItemResponseDTO;
import com.innogent.pantry_mind.dto.response.ShoppingSuggestionDTO;
import com.innogent.pantry_mind.entity.*;
import com.innogent.pantry_mind.mapper.ShoppingListMapper;
import com.innogent.pantry_mind.repository.*;
import com.innogent.pantry_mind.service.ShoppingListService;
import com.innogent.pantry_mind.util.NameNormalizationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShoppingListServiceImpl implements ShoppingListService {

    private final ShoppingListRepository shoppingListRepository;
    private final ShoppingListItemRepository shoppingListItemRepository;
    private final KitchenRepository kitchenRepository;
    private final UserRepository userRepository;
    private final UnitRepository unitRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final CategoryRepository categoryRepository;
    private final LocationRepository locationRepository;
    private final ConsumptionEventRepository consumptionEventRepository;
    private final ShoppingListMapper shoppingListMapper;
    private final RestTemplate restTemplate;

    @Value("${python.backend.url:http://localhost:8000}")
    private String pythonBackendUrl;

    @Override
    public List<ShoppingListResponseDTO> getOrCreateFixedLists(Long kitchenId) {
        Kitchen kitchen = kitchenRepository.findById(kitchenId)
            .orElseThrow(() -> new RuntimeException("Kitchen not found"));

        List<ShoppingList> existingLists = shoppingListRepository.findByKitchenIdOrderByListType(kitchenId);
        Map<ShoppingList.ListType, ShoppingList> existingMap = existingLists.stream()
            .collect(Collectors.toMap(ShoppingList::getListType, list -> list));

        List<ShoppingList> allLists = new ArrayList<>();
        
        for (ShoppingList.ListType type : ShoppingList.ListType.values()) {
            if (existingMap.containsKey(type)) {
                allLists.add(existingMap.get(type));
            } else {
                ShoppingList newList = ShoppingList.builder()
                    .kitchen(kitchen)
                    .listType(type)
                    .status(ShoppingList.ListStatus.ACTIVE)
                    .createdBy(getCurrentUser())
                    .build();
                allLists.add(shoppingListRepository.save(newList));
            }
        }

        return allLists.stream()
            .map(shoppingListMapper::toResponseDTO)
            .collect(Collectors.toList());
    }

    @Override
    public List<ShoppingListResponseDTO> getShoppingListsByKitchen(Long kitchenId) {
        List<ShoppingList> lists = shoppingListRepository.findByKitchenIdOrderByListType(kitchenId);
        return lists.stream()
            .map(shoppingListMapper::toResponseDTO)
            .collect(Collectors.toList());
    }

    @Override
    public ShoppingListResponseDTO createShoppingList(CreateShoppingListRequestDTO dto, Long userId) {
        Kitchen kitchen = kitchenRepository.findById(dto.getKitchenId())
            .orElseThrow(() -> new RuntimeException("Kitchen not found"));
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        ShoppingList shoppingList = ShoppingList.builder()
            .kitchen(kitchen)
            .listType(dto.getListType())
            .status(ShoppingList.ListStatus.ACTIVE)
            .createdBy(user)
            .build();

        ShoppingList saved = shoppingListRepository.save(shoppingList);
        return shoppingListMapper.toResponseDTO(saved);
    }

    @Override
    public void deleteShoppingList(Long id) {
        shoppingListRepository.deleteById(id);
    }

    @Override
    public ShoppingListResponseDTO getShoppingListById(Long id) {
        ShoppingList shoppingList = shoppingListRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Shopping list not found"));
        return shoppingListMapper.toResponseDTO(shoppingList);
    }

    @Override
    @Transactional
    public ShoppingListItemResponseDTO addItemToList(AddShoppingListItemRequestDTO dto, Long userId) {
        ShoppingList shoppingList = shoppingListRepository.findById(dto.getShoppingListId())
            .orElseThrow(() -> new RuntimeException("Shopping list not found"));
        
        Unit unit = unitRepository.findById(dto.getUnitId())
            .orElseThrow(() -> new RuntimeException("Unit not found"));
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        String canonicalName = NameNormalizationUtil.normalizeName(dto.getItemName());

        Optional<ShoppingListItem> existing = shoppingListItemRepository
            .findByShoppingListAndCanonicalName(shoppingList, canonicalName);
        
        if (existing.isPresent()) {
            throw new RuntimeException("Item already exists in the shopping list");
        }

        ShoppingListItem item = ShoppingListItem.builder()
            .shoppingList(shoppingList)
            .canonicalName(canonicalName)
            .rawName(dto.getItemName())
            .suggestedQuantity(dto.getQuantity())
            .unit(unit)
            .status(ShoppingListItem.ItemStatus.PENDING)
            .addedBy(user)
            .suggestedBy(ShoppingListItem.SuggestionSource.MANUAL)
            .build();

        ShoppingListItem saved = shoppingListItemRepository.save(item);
        return shoppingListMapper.toItemResponseDTO(saved);
    }

    @Override
    @Transactional
    public ShoppingListItemResponseDTO updateItemQuantity(Long itemId, UpdateShoppingListItemRequestDTO dto) {
        ShoppingListItem item = shoppingListItemRepository.findById(itemId)
            .orElseThrow(() -> new RuntimeException("Shopping list item not found"));

        item.setSuggestedQuantity(dto.getQuantity());
        if (dto.getUnitId() != null) {
            Unit unit = unitRepository.findById(dto.getUnitId())
                .orElseThrow(() -> new RuntimeException("Unit not found"));
            item.setUnit(unit);
        }

        ShoppingListItem updated = shoppingListItemRepository.save(item);
        return shoppingListMapper.toItemResponseDTO(updated);
    }

    @Override
    @Transactional
    public ShoppingListItemResponseDTO updateItemStatus(Long itemId, String status) {
        ShoppingListItem item = shoppingListItemRepository.findById(itemId)
            .orElseThrow(() -> new RuntimeException("Shopping list item not found"));

        item.setStatus(ShoppingListItem.ItemStatus.valueOf(status.toUpperCase()));
        ShoppingListItem updated = shoppingListItemRepository.save(item);
        return shoppingListMapper.toItemResponseDTO(updated);
    }

    @Override
    @Transactional
    public void deleteShoppingListItem(Long itemId) {
        shoppingListItemRepository.deleteById(itemId);
    }

    @Override
    @Transactional
    public List<ShoppingSuggestionDTO> getAISuggestions(Long listId, Long kitchenId, Long userId) {
        try {
            ShoppingList shoppingList = shoppingListRepository.findById(listId)
                .orElseThrow(() -> new RuntimeException("Shopping list not found"));

            // Get existing items in current list
            List<String> existingItems = shoppingListItemRepository.findByShoppingList(shoppingList)
                .stream()
                .map(ShoppingListItem::getCanonicalName)
                .collect(Collectors.toList());

            // Get recently purchased items to exclude
            List<String> recentlyPurchased = getRecentlyPurchasedItems(kitchenId, shoppingList.getListType());
            
            // Combine existing and recently purchased for exclusion
            Set<String> itemsToExclude = new HashSet<>(existingItems);
            itemsToExclude.addAll(recentlyPurchased);

            try {
                // Get consumption data for AI analysis
                Map<String, Object> consumptionData = getConsumptionDataForAI(kitchenId);
                
                Map<String, Object> request = new HashMap<>();
                request.put("kitchenId", kitchenId);
                request.put("listType", shoppingList.getListType().name());
                request.put("existingItems", new ArrayList<>(itemsToExclude));
                request.put("consumptionData", consumptionData);

                System.out.println("Sending AI request for " + shoppingList.getListType().name() + " list with " + 
                    ((List<?>) consumptionData.get("consumptionEvents")).size() + " consumption events");

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

                System.out.println("DEBUG: About to call Python API at: " + pythonBackendUrl + "/api/ai-shopping/suggestions");
                System.out.println("DEBUG: RestTemplate instance: " + restTemplate);

                @SuppressWarnings("unchecked")
                Map<String, Object> response = restTemplate.postForObject(
                    pythonBackendUrl + "/api/ai-shopping/suggestions", entity, Map.class);

                System.out.println("DEBUG: Response received: " + response);

                if (response != null && response.containsKey("suggestions")) {
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> suggestions = (List<Map<String, Object>>) response.get("suggestions");
                    System.out.println("Received " + suggestions.size() + " AI suggestions");
                    return convertToSuggestionDTOs(suggestions);
                }
            } catch (Exception e) {
                System.err.println("Python backend error: " + e.getMessage());
                // Fallback to low stock suggestions on error
            }

            return getLowStockSuggestions(kitchenId, new ArrayList<>(itemsToExclude));
            
        } catch (Exception e) {
            System.err.println("AI suggestions error: " + e.getMessage());
            return Collections.emptyList();
        }
    }

    private List<ShoppingSuggestionDTO> convertToSuggestionDTOs(List<Map<String, Object>> suggestions) {
        return suggestions.stream().map(suggestion -> {
            String unitName = (String) suggestion.get("unit");
            Unit unit = unitRepository.findByName(unitName).orElse(null);

            Object quantityObj = suggestion.get("quantity");
            BigDecimal quantity = quantityObj != null ? 
               new BigDecimal(quantityObj.toString()).setScale(0, RoundingMode.HALF_UP) : BigDecimal.ONE;

            return ShoppingSuggestionDTO.builder()
                .itemName((String) suggestion.get("name"))
                .suggestedQuantity(quantity)
                .unitName(unitName)
                .unitId(unit != null ? unit.getId() : null)
                .reason((String) suggestion.get("reason"))
                .confidenceScore(BigDecimal.valueOf(0.8))
                .build();
        }).collect(Collectors.toList());
    }

    private List<ShoppingSuggestionDTO> getLowStockSuggestions(Long kitchenId, List<String> existingItems) {
        List<Inventory> lowStockItems = inventoryRepository.findLowStockItems(kitchenId);

        return lowStockItems.stream()
            .filter(inventory -> !existingItems.contains(NameNormalizationUtil.normalizeName(inventory.getName())))
            .limit(5)
            .map(inventory -> {
                BigDecimal suggestedQuantity = calculateSuggestedQuantityWithOriginalUnit(inventory);
                
                return ShoppingSuggestionDTO.builder()
                    .itemName(inventory.getName())
                    .suggestedQuantity(suggestedQuantity)
                    .unitName(inventory.getUnit() != null ? inventory.getUnit().getName() : "pieces")
                    .unitId(inventory.getUnit() != null ? inventory.getUnit().getId() : null)
                    .reason("Low stock - needs restocking")
                    .confidenceScore(BigDecimal.valueOf(0.7))
                    .build();
            })
            .collect(Collectors.toList());
    }

    private BigDecimal calculateSuggestedQuantityWithOriginalUnit(Inventory inventory) {
        Long currentQuantity = inventory.getTotalQuantity() != null ? inventory.getTotalQuantity() : 0L;
        Long minStock = inventory.getMinStock() != null ? inventory.getMinStock() : 5L;
        
        Long neededQuantity = Math.max(minStock - currentQuantity + (minStock / 2), 1L);
        return BigDecimal.valueOf(neededQuantity);
    }

    @Override
    public Map<String, Object> getConsumptionDataForAI(Long kitchenId) {
        // Fetch actual consumption events from the last 90 days
        LocalDateTime analysisStartDate = LocalDateTime.now().minusDays(90);
        List<ConsumptionEvent> consumptionEvents = consumptionEventRepository
            .findByKitchenIdAndCreatedAtAfter(kitchenId, analysisStartDate);
        
        // Convert consumption events to the format expected by Python AI
        List<Map<String, Object>> consumptionData = consumptionEvents.stream()
            .map(event -> {
                Map<String, Object> eventMap = new HashMap<>();
                eventMap.put("itemName", event.getCanonicalName());
                eventMap.put("quantity", event.getQuantityConsumed());
                eventMap.put("consumedAt", event.getCreatedAt().toString());
                eventMap.put("reason", event.getReason().toString());
                if (event.getUnit() != null) {
                    eventMap.put("unit", event.getUnit().getName());
                }
                return eventMap;
            })
            .collect(Collectors.toList());
        
        // Fetch current inventory
        List<Inventory> inventory = inventoryRepository.findByKitchenId(kitchenId);
        List<Map<String, Object>> inventoryData = inventory.stream()
            .map(item -> {
                Map<String, Object> map = new HashMap<>();
                map.put("itemName", item.getName());
                map.put("currentQuantity", item.getTotalQuantity());
                map.put("minStock", item.getMinStock());
                map.put("unit", item.getUnit() != null ? item.getUnit().getName() : "pieces");
                return map;
            })
            .collect(Collectors.toList());
        
        Map<String, Object> result = new HashMap<>();
        result.put("consumptionEvents", consumptionData);
        result.put("currentInventory", inventoryData);
        result.put("kitchenId", kitchenId);
        result.put("analysisStartDate", analysisStartDate.toString());
        
        System.out.println("Fetched " + consumptionData.size() + " consumption events and " + 
            inventoryData.size() + " inventory items for AI analysis");
        return result;
    }

    @Override
    @Transactional
    public List<ShoppingListItemResponseDTO> generateAISuggestions(Long listId, Long kitchenId, Long userId) {
        List<ShoppingSuggestionDTO> suggestions = getAISuggestions(listId, kitchenId, userId);
        return addSuggestionsToList(listId, suggestions, userId);
    }

    @Override
    @Transactional
    public List<ShoppingListItemResponseDTO> addSuggestionsToList(Long listId, List<ShoppingSuggestionDTO> suggestions, Long userId) {
        ShoppingList shoppingList = shoppingListRepository.findById(listId)
            .orElseThrow(() -> new RuntimeException("Shopping list not found"));

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        List<ShoppingListItem> items = suggestions.stream().map(suggestion -> {
            String canonicalName = NameNormalizationUtil.normalizeName(suggestion.getItemName());

            Unit unit = suggestion.getUnitId() != null ? 
                unitRepository.findById(suggestion.getUnitId()).orElse(null) : null;

            return ShoppingListItem.builder()
                .shoppingList(shoppingList)
                .canonicalName(canonicalName)
                .rawName(suggestion.getItemName())
                .suggestedQuantity(suggestion.getSuggestedQuantity())
                .unit(unit)
                .status(ShoppingListItem.ItemStatus.PENDING)
                .addedBy(user)
                .suggestedBy(ShoppingListItem.SuggestionSource.AI)
                .suggestionReason(suggestion.getReason())
                .confidenceScore(suggestion.getConfidenceScore())
                .build();
        }).collect(Collectors.toList());

        List<ShoppingListItem> saved = shoppingListItemRepository.saveAll(items);
        return saved.stream()
            .map(shoppingListMapper::toItemResponseDTO)
            .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> addAllLowStockItems(Long listId, Long kitchenId, Long userId) {
        List<ShoppingSuggestionDTO> suggestions = getLowStockSuggestions(kitchenId, Collections.emptyList());
        List<ShoppingListItemResponseDTO> added = addSuggestionsToList(listId, suggestions, userId);
        
        Map<String, Object> result = new HashMap<>();
        result.put("itemsAdded", added.size());
        result.put("items", added);
        return result;
    }

    @Override
    @Transactional
    public List<ShoppingListItemResponseDTO> addSelectedItems(Long listId, List<String> itemNames, Long userId) {
        ShoppingList shoppingList = shoppingListRepository.findById(listId)
            .orElseThrow(() -> new RuntimeException("Shopping list not found"));
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        List<ShoppingListItem> items = new ArrayList<>();
        
        for (String itemName : itemNames) {
            String canonicalName = NameNormalizationUtil.normalizeName(itemName);
            
            if (shoppingListItemRepository.findByShoppingListAndCanonicalName(shoppingList, canonicalName).isPresent()) {
                continue;
            }

            ShoppingListItem item = ShoppingListItem.builder()
                .shoppingList(shoppingList)
                .canonicalName(canonicalName)
                .rawName(itemName)
                .suggestedQuantity(BigDecimal.ONE)
                .status(ShoppingListItem.ItemStatus.PENDING)
                .addedBy(user)
                .suggestedBy(ShoppingListItem.SuggestionSource.MANUAL)
                .build();

            items.add(item);
        }

        List<ShoppingListItem> saved = shoppingListItemRepository.saveAll(items);
        return saved.stream()
            .map(shoppingListMapper::toItemResponseDTO)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Map<String, Object> markAsPurchasedAndUpdateInventory(Long itemId, String actualQuantity, Long userId) {
        ShoppingListItem item = shoppingListItemRepository.findById(itemId)
            .orElseThrow(() -> new RuntimeException("Shopping list item not found"));

        item.setStatus(ShoppingListItem.ItemStatus.PURCHASED);
        shoppingListItemRepository.save(item);

        Inventory inventory = inventoryRepository.findByNameAndKitchenId(
            item.getCanonicalName(), item.getShoppingList().getKitchen().getId());

        if (inventory != null) {
            BigDecimal quantity = actualQuantity != null ? 
                new BigDecimal(actualQuantity) : item.getSuggestedQuantity();
            
            inventory.setTotalQuantity(inventory.getTotalQuantity() + quantity.longValue());
            inventoryRepository.save(inventory);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("status", "success");
        result.put("message", "Item marked as purchased");
        return result;
    }

    @Override
    public List<Map<String, Object>> getLowStockItems(Long kitchenId) {
        List<Inventory> lowStockItems = inventoryRepository.findLowStockItems(kitchenId);
        
        List<Map<String, Object>> result = new ArrayList<>();
        for (Inventory item : lowStockItems) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", item.getId());
            map.put("name", item.getName());
            map.put("currentQuantity", item.getTotalQuantity());
            map.put("minStock", item.getMinStock());
            map.put("unit", item.getUnit() != null ? item.getUnit().getName() : "pieces");
            result.add(map);
        }
        return result;
    }

    @Override
    @Transactional
    public void addItemToInventory(Long listId, Long itemId, AddToInventoryRequest request) {
        ShoppingListItem item = shoppingListItemRepository.findById(itemId)
            .orElseThrow(() -> new RuntimeException("Shopping list item not found"));
        
        ShoppingList list = item.getShoppingList();
        User currentUser = getCurrentUser();
        
        Inventory inventory = inventoryRepository.findByNameAndKitchenId(
            item.getCanonicalName(), list.getKitchen().getId());
        
        if (inventory == null) {
            String displayName = item.getRawName() != null && !item.getRawName().trim().isEmpty() 
                ? item.getRawName() 
                : item.getCanonicalName();
                
            inventory = Inventory.builder()
                .name(displayName)
                .normalizedName(NameNormalizationUtil.normalizeName(item.getCanonicalName()))
                .kitchenId(list.getKitchen().getId())
                .unit(unitRepository.findById(request.getUnitId()).orElse(null))
                .category(categoryRepository.findById(request.getCategoryId()).orElse(null))
                .totalQuantity(request.getQuantity().longValue())
                .itemCount(1)
                .minStock(5L)
                .build();
        } else {
            inventory.setTotalQuantity(inventory.getTotalQuantity() + request.getQuantity().longValue());
            inventory.setItemCount(inventory.getItemCount() + 1);
        }
        
        inventoryRepository.save(inventory);
        
        InventoryItem inventoryItem = InventoryItem.builder()
            .inventory(inventory)
            .originalQuantity(request.getQuantity())
            .currentQuantity(request.getQuantity())
            .isActive(true)
            .status(InventoryItem.ItemStatus.FRESH)
            .expiryDate(request.getExpiryDate() != null ? 
                java.sql.Date.valueOf(request.getExpiryDate()) : null)
            .price(request.getPrice())
            .description(request.getDescription())
            .location(request.getLocationId() != null ? 
                locationRepository.findById(request.getLocationId()).orElse(null) : null)
            .createdBy(currentUser.getId())
            .build();
        
        inventoryItemRepository.save(inventoryItem);
        shoppingListItemRepository.delete(item);
    }

    // New methods for purchased items management
    @Override
    @Transactional
    public ShoppingListItemResponseDTO markItemAsPurchased(Long itemId) {
        ShoppingListItem item = shoppingListItemRepository.findById(itemId)
            .orElseThrow(() -> new RuntimeException("Shopping list item not found"));

        item.setStatus(ShoppingListItem.ItemStatus.PURCHASED);
        item.setPurchasedAt(LocalDateTime.now());
        
        ShoppingListItem updated = shoppingListItemRepository.save(item);
        return shoppingListMapper.toItemResponseDTO(updated);
    }

    @Override
    @Transactional
    public List<ShoppingListItemResponseDTO> markMultipleItemsAsPurchased(List<Long> itemIds) {
        List<ShoppingListItem> items = shoppingListItemRepository.findAllById(itemIds);
        LocalDateTime now = LocalDateTime.now();
        
        items.forEach(item -> {
            item.setStatus(ShoppingListItem.ItemStatus.PURCHASED);
            item.setPurchasedAt(now);
        });
        
        List<ShoppingListItem> updated = shoppingListItemRepository.saveAll(items);
        return updated.stream()
            .map(shoppingListMapper::toItemResponseDTO)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void cleanupPurchasedItems() {
        LocalDateTime now = LocalDateTime.now();
        
        // Daily lists: cleanup after 10 AM next day
        LocalDateTime dailyCleanupTime = now.toLocalDate().atTime(10, 0);
        if (now.isBefore(dailyCleanupTime)) {
            dailyCleanupTime = dailyCleanupTime.minusDays(1);
        }
        
        // Weekly lists: cleanup after Monday
        LocalDateTime weeklyCleanupTime = now.toLocalDate()
            .with(java.time.DayOfWeek.MONDAY)
            .atStartOfDay();
        if (now.getDayOfWeek().getValue() < 1) {
            weeklyCleanupTime = weeklyCleanupTime.minusWeeks(1);
        }
        
        // Monthly lists: cleanup after 1st of month
        LocalDateTime monthlyCleanupTime = now.toLocalDate()
            .withDayOfMonth(1)
            .atStartOfDay();
        if (now.getDayOfMonth() == 1 && now.getHour() < 1) {
            monthlyCleanupTime = monthlyCleanupTime.minusMonths(1);
        }
        
        shoppingListItemRepository.deletePurchasedItemsByTimeAndType(
            dailyCleanupTime, weeklyCleanupTime, monthlyCleanupTime);
    }

    private List<String> getRecentlyPurchasedItems(Long kitchenId, ShoppingList.ListType listType) {
        LocalDateTime cutoffTime = calculateCutoffTime(listType);
        
        return shoppingListItemRepository
            .findRecentlyPurchasedItemsByKitchenAndType(kitchenId, listType, cutoffTime)
            .stream()
            .map(ShoppingListItem::getCanonicalName)
            .collect(Collectors.toList());
    }

    private LocalDateTime calculateCutoffTime(ShoppingList.ListType listType) {
        LocalDateTime now = LocalDateTime.now();
        
        switch (listType) {
            case DAILY:
                return now.toLocalDate().atTime(10, 0);
            case WEEKLY:
                return now.toLocalDate().with(java.time.DayOfWeek.MONDAY).atStartOfDay();
            case MONTHLY:
                return now.toLocalDate().withDayOfMonth(1).atStartOfDay();
            case RANDOM:
            default:
                return now.minusHours(24);
        }
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
