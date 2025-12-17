package com.innogent.pantry_mind.service.impl;

import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.innogent.pantry_mind.dto.request.AdvancedRecipeRequestDTO;
import com.innogent.pantry_mind.dto.request.RecipeRequestDTO;
import com.innogent.pantry_mind.dto.response.RecipeResponseDTO;
import com.innogent.pantry_mind.dto.response.UserPreferencesResponseDTO;
import com.innogent.pantry_mind.entity.Inventory;
import com.innogent.pantry_mind.repository.InventoryRepository;
import com.innogent.pantry_mind.service.RecipeService;
import com.innogent.pantry_mind.service.UserPreferencesService;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class RecipeServiceImpl implements RecipeService {
    
    private final InventoryRepository inventoryRepository;
    private final RestTemplate restTemplate;
    private final UserPreferencesService userPreferencesService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public RecipeResponseDTO generateRecipes(Long kitchenId, Integer servings) {
        return generateRecipes(kitchenId, servings, null);
    }
    
    @Override
    public RecipeResponseDTO generateRecipes(Long kitchenId, Integer servings, String category) {
        System.out.println("🚀 [BACKEND] Recipe generation started for kitchenId: " + kitchenId + ", servings: " + servings + ", category: " + category);
        
        List<Inventory> inventory = inventoryRepository.findByKitchenIdAndTotalQuantityGreaterThan(kitchenId, 0L);
        System.out.println("📦 [BACKEND] Found " + inventory.size() + " inventory items");
        
        if (inventory.isEmpty()) {
            System.out.println("⚠️ [BACKEND] No inventory found, returning empty recipes");
            return createEmptyRecipes();
        }
        
        System.out.println("📋 [BACKEND] DETAILED INVENTORY ITEMS BEING SENT TO AI:");
        System.out.println("=" .repeat(60));
        
        RecipeRequestDTO request = new RecipeRequestDTO();
        request.setItems(inventory.stream().map(this::mapToInventoryItemDTO).collect(Collectors.toList()));
        request.setServings(servings);
        
        // Add category if provided
        if (category != null && !category.trim().isEmpty()) {
            System.out.println("🏷️ [BACKEND] Adding category filter: " + category);
        }
        
        // Log each inventory item in detail
        for (int i = 0; i < inventory.size(); i++) {
            Inventory item = inventory.get(i);
            System.out.println("📦 Item " + (i+1) + ":");
            System.out.println("   Name: " + item.getName());
            System.out.println("   Quantity: " + item.getTotalQuantity());
            System.out.println("   Unit: " + (item.getUnit() != null ? item.getUnit().getName() : "pieces"));
            System.out.println("   Category: " + (item.getCategory() != null ? item.getCategory().getName() : "No category"));
            System.out.println("   Item Count: " + item.getItemCount());
            System.out.println("   ---");
        }
        
        System.out.println("=" .repeat(60));
        System.out.println("📝 [BACKEND] SUMMARY - Inventory data being sent to AI:");
        request.getItems().forEach(item -> 
            System.out.println("  ✅ " + item.getName() + ": " + item.getQuantity() + " " + item.getUnit())
        );
        System.out.println("👥 [BACKEND] Target servings: " + servings + " people");
        System.out.println("=" .repeat(60));
        
        try {
            String url = "http://localhost:8001/ai/recipes";
            if (category != null && !category.trim().isEmpty()) {
                url += "?category=" + category.trim();
                System.out.println("🎯 [BACKEND] Calling AI service with category at: " + url);
            } else {
                System.out.println("🤖 [BACKEND] Calling AI service at: " + url);
            }
            System.out.println("📤 [BACKEND] Request payload:");
            System.out.println("   Items count: " + request.getItems().size());
            System.out.println("   Servings: " + request.getServings());
            System.out.println("   Category: " + (category != null ? category : "None"));
            
            RecipeResponseDTO response = restTemplate.postForObject(url, request, RecipeResponseDTO.class);
            
            if (response != null && response.getRecipes() != null) {
                System.out.println("✅ [BACKEND] AI service responded successfully!" + (category != null ? " for category: " + category : ""));
                System.out.println("📊 [BACKEND] Generated " + response.getRecipes().size() + " recipes:");
                
                for (int i = 0; i < response.getRecipes().size(); i++) {
                    RecipeResponseDTO.Recipe recipe = response.getRecipes().get(i);
                    System.out.println("🍳 Recipe " + (i+1) + ": " + recipe.getName());
                    System.out.println("   Servings: " + recipe.getServings());
                    System.out.println("   Cooking time: " + recipe.getCookingTime());
                    System.out.println("   Ingredients count: " + (recipe.getIngredients() != null ? recipe.getIngredients().size() : 0));
                    System.out.println("   Missing items count: " + (recipe.getMissingItems() != null ? recipe.getMissingItems().size() : 0));
                }
            } else {
                System.out.println("⚠️ [BACKEND] AI service returned null or empty response");
            }
            
            return response;
        } catch (Exception e) {
            System.err.println("❌ [BACKEND] AI service call failed: " + e.getMessage());
            System.err.println("🔄 [BACKEND] Falling back to default recipes" + (category != null ? " for category: " + category : ""));
            e.printStackTrace();
            return createFallbackRecipes(servings);
        }
    }
    
    private RecipeRequestDTO.InventoryItemDTO mapToInventoryItemDTO(Inventory inventory) {
        RecipeRequestDTO.InventoryItemDTO dto = new RecipeRequestDTO.InventoryItemDTO();
        dto.setName(inventory.getName());
        dto.setQuantity(inventory.getTotalQuantity());
        dto.setUnit(inventory.getUnit() != null ? inventory.getUnit().getName() : "pieces");
        
        // Log the mapping
        System.out.println("🔄 [BACKEND] Mapping: " + inventory.getName() + 
                          " (" + inventory.getTotalQuantity() + " " + 
                          (inventory.getUnit() != null ? inventory.getUnit().getName() : "pieces") + ")");
        
        return dto;
    }
    
    private RecipeResponseDTO createEmptyRecipes() {
        System.out.println("📝 [BACKEND] Creating empty recipe response");
        RecipeResponseDTO response = new RecipeResponseDTO();
        RecipeResponseDTO.Recipe recipe = new RecipeResponseDTO.Recipe();
        recipe.setName("No Recipe Available");
        recipe.setIngredients(List.of("No ingredients available"));
        recipe.setMissingItems(List.of("Add some ingredients to your pantry"));
        recipe.setSteps(List.of("Stock your pantry first"));
        recipe.setServings(1);
        recipe.setCookingTime("0 mins");
        
        response.setRecipes(List.of(recipe));
        return response;
    }
    
    private RecipeResponseDTO createFallbackRecipes(Integer servings) {
        System.out.println("🔄 [BACKEND] Creating fallback recipes for " + servings + " servings");
        RecipeResponseDTO response = new RecipeResponseDTO();
        
        // Create 1 fallback recipe
        RecipeResponseDTO.Recipe recipe1 = new RecipeResponseDTO.Recipe();
        recipe1.setName("Simple Basic Recipe");
        recipe1.setIngredients(List.of("Available ingredients: as needed"));
        recipe1.setMissingItems(List.of("Basic spices: as needed"));
        recipe1.setSteps(List.of("Use available ingredients", "Cook as desired", "Season and serve"));
        recipe1.setServings(servings);
        recipe1.setCookingTime("15 mins");
        
        response.setRecipes(List.of(recipe1));
        
        System.out.println("✅ [BACKEND] Created 1 fallback recipe");
        return response;
    }
    
    @Override
    public RecipeResponseDTO generateAdvancedRecipes(Long kitchenId, AdvancedRecipeRequestDTO request) {
        // System.out.println("🚀 [BACKEND] Advanced recipe generation started for kitchenId: " + kitchenId);
        // System.out.println("📋 [BACKEND] Recipe type: " + request.getRecipeType());
        
        try {
            // Call specific endpoint based on recipe type
            String url;
            if ("QUICK".equals(request.getRecipeType())) {
                url = "http://localhost:8001/ai/quick-recipes";
            } else if ("EXPIRY_BASED".equals(request.getRecipeType())) {
                url = "http://localhost:8001/ai/expiry-recipes";
            } else {
                url = "http://localhost:8001/ai/advanced-recipes";
            }
            
            // System.out.println("🎯 [BACKEND] Calling Python service at: " + url);
            // System.out.println("📎 [BACKEND] Request data: recipeType=" + request.getRecipeType() + ", maxTime=" + request.getMaxCookingTime());
            RecipeResponseDTO response = restTemplate.postForObject(url, request, RecipeResponseDTO.class);
            
            if (response != null && response.getRecipes() != null) {
                // System.out.println("✅ [BACKEND] Advanced recipes generated successfully!");
                // System.out.println("📊 [BACKEND] Generated " + response.getRecipes().size() + " recipes");
            }
            
            return response;
        } catch (Exception e) {
            System.err.println("❌ [BACKEND] Advanced recipe generation failed: " + e.getMessage());
            return createFallbackRecipes(request.getServings());
        }
    }
    
    @Override
    public RecipeResponseDTO generateExpiryBasedRecipes(Long kitchenId, Integer servings, Long userId) {
        // System.out.println("⏰ [BACKEND] Expiry-based recipe generation for kitchenId: " + kitchenId);
        
        // Get items expiring in next 3 days
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DAY_OF_MONTH, 3);
        Date threeDaysFromNow = cal.getTime();
        
        List<Inventory> expiringInventory = inventoryRepository.findExpiringInventoryByKitchenId(kitchenId, threeDaysFromNow);
        List<Inventory> allInventory = inventoryRepository.findByKitchenIdAndTotalQuantityGreaterThan(kitchenId, 0L);
        
        // System.out.println("⚠️ [BACKEND] Found " + expiringInventory.size() + " expiring items:");
        // expiringInventory.forEach(item -> 
        //     System.out.println("   - " + item.getName() + " (expires soon)")
        // );
        
        AdvancedRecipeRequestDTO request = new AdvancedRecipeRequestDTO();
        request.setItems(allInventory.stream().map(this::mapToAdvancedInventoryItemDTO).collect(Collectors.toList()));
        
        // CRITICAL: Properly mark expiring items
        List<AdvancedRecipeRequestDTO.InventoryItemDTO> expiringItemDTOs = expiringInventory.stream()
            .map(item -> {
                AdvancedRecipeRequestDTO.InventoryItemDTO dto = mapToAdvancedInventoryItemDTO(item);
                dto.setIsExpiring(true); // MARK AS EXPIRING
                return dto;
            })
            .collect(Collectors.toList());
        
        request.setExpiringItems(expiringItemDTOs);
        request.setServings(servings);
        request.setRecipeType("EXPIRY_BASED");
        request.setUserId(userId);
        
        // DEBUG LOGS
        // System.out.println("🔍 [BACKEND] DEBUG - Request expiring items size: " + request.getExpiringItems().size());
        // if (!request.getExpiringItems().isEmpty()) {
        //     System.out.println("🔍 [BACKEND] First expiring item: " + request.getExpiringItems().get(0).getName());
        //     System.out.println("🔍 [BACKEND] First expiring item isExpiring: " + request.getExpiringItems().get(0).getIsExpiring());
        // }
        
        System.out.println("📤 [BACKEND] Sending " + expiringItemDTOs.size() + " expiring items to AI");
        
        // Add user preferences if available
        if (userId != null) {
            try {
                UserPreferencesResponseDTO preferences = userPreferencesService.getUserPreferences(userId);
                request.setMaxCookingTime(preferences.getMaxCookingTime());
                request.setSkillLevel(preferences.getSkillLevel());
                request.setDietaryRestrictions(preferences.getDietaryRestrictions());
                request.setCuisinePreferences(preferences.getCuisinePreferences());
            } catch (Exception e) {
                System.out.println("⚠️ [BACKEND] Could not load user preferences: " + e.getMessage());
            }
        }
        
        return generateAdvancedRecipes(kitchenId, request);
    }
    
    @Override
    public RecipeResponseDTO generateQuickRecipes(Long kitchenId, Integer maxTime, Integer servings, Long userId) {
        System.out.println("⚡ [BACKEND] Quick recipe generation for kitchenId: " + kitchenId + ", maxTime: " + maxTime);
        System.out.println("🔍 [BACKEND] generateQuickRecipes method called - this should be QUICK type");
        
        List<Inventory> inventory = inventoryRepository.findByKitchenIdAndTotalQuantityGreaterThan(kitchenId, 0L);
        System.out.println("📦 [BACKEND] Found " + inventory.size() + " inventory items for quick recipes");
        
        AdvancedRecipeRequestDTO request = new AdvancedRecipeRequestDTO();
        request.setItems(inventory.stream().map(this::mapToAdvancedInventoryItemDTO).collect(Collectors.toList()));
        request.setServings(servings);
        request.setRecipeType("QUICK");
        request.setMaxCookingTime(maxTime);
        request.setUserId(userId);
        
        System.out.println("📋 [BACKEND] Setting recipe type to: QUICK");
        System.out.println("⏱️ [BACKEND] Setting max cooking time to: " + maxTime);
        System.out.println("🍽️ [BACKEND] Setting servings to: " + servings);
        System.out.println("📤 [BACKEND] QUICK RECIPE REQUEST DATA:");
        System.out.println("   Total Items: " + request.getItems().size());
        System.out.println("   Recipe Type: " + request.getRecipeType());
        System.out.println("   Max Time: " + request.getMaxCookingTime());
        
        System.out.println("🔍 [BACKEND] INVENTORY ITEMS BEING SENT:");
        for (int i = 0; i < Math.min(5, request.getItems().size()); i++) {
            AdvancedRecipeRequestDTO.InventoryItemDTO item = request.getItems().get(i);
            System.out.println("   " + (i+1) + ". " + item.getName() + ": " + item.getQuantity() + " " + item.getUnit());
        }
        if (request.getItems().size() > 5) {
            System.out.println("   ... and " + (request.getItems().size() - 5) + " more items");
        }
        
        // Add user preferences if available
        if (userId != null) {
            try {
                UserPreferencesResponseDTO preferences = userPreferencesService.getUserPreferences(userId);
                request.setSkillLevel(preferences.getSkillLevel());
                request.setDietaryRestrictions(preferences.getDietaryRestrictions());
            } catch (Exception e) {
                System.out.println("⚠️ [BACKEND] Could not load user preferences: " + e.getMessage());
            }
        }
        
        return generateAdvancedRecipes(kitchenId, request);
    }
    

    
    @Override
    public RecipeResponseDTO generateRecipeByName(Long kitchenId, String recipeName, Integer servings) {
        System.out.println("🍳 [BACKEND] Recipe by name generation for: " + recipeName);
        System.out.println("👥 [BACKEND] Servings requested: " + servings);
        System.out.println("🏠 [BACKEND] Kitchen ID: " + kitchenId);
        
        List<Inventory> inventory = inventoryRepository.findByKitchenIdAndTotalQuantityGreaterThan(kitchenId, 0L);
        
        if (inventory.isEmpty()) {
            return createEmptyRecipes();
        }
        
        // Create request for specific recipe
        Map<String, Object> request = new HashMap<>();
        request.put("recipeName", recipeName);
        request.put("servings", servings);
        request.put("availableItems", inventory.stream().map(this::mapToInventoryItemDTO).collect(Collectors.toList()));
        
        System.out.println("🎯 [BACKEND] Requesting specific recipe: " + recipeName);
        System.out.println("📦 [BACKEND] Available items: " + inventory.size());
        System.out.println("📝 [BACKEND] Request payload being sent to Python:");
        System.out.println("   Recipe Name: " + request.get("recipeName"));
        System.out.println("   Servings: " + request.get("servings"));
        System.out.println("   Available Items Count: " + ((List<?>) request.get("availableItems")).size());
        
        try {
            RecipeResponseDTO response = restTemplate.postForObject("http://localhost:8001/ai/recipe-by-name", request, RecipeResponseDTO.class);
            
            if (response != null && response.getRecipes() != null) {
                System.out.println("✅ [BACKEND] Recipe generated for: " + recipeName);
            }
            
            return response;
        } catch (Exception e) {
            System.err.println("❌ [BACKEND] Recipe by name failed: " + e.getMessage());
            return createFallbackRecipeByName(recipeName, servings);
        }
    }
    
    private RecipeResponseDTO createFallbackRecipeByName(String recipeName, Integer servings) {
        RecipeResponseDTO response = new RecipeResponseDTO();
        RecipeResponseDTO.Recipe recipe = new RecipeResponseDTO.Recipe();
        
        recipe.setName(recipeName);
        recipe.setIngredients(List.of("Basic ingredients for " + recipeName));
        recipe.setMissingItems(List.of("Check recipe ingredients online"));
        recipe.setSteps(List.of("Search for " + recipeName + " recipe online", "Use available ingredients", "Buy missing items"));
        recipe.setServings(servings);
        recipe.setCookingTime("30 mins");
        
        response.setRecipes(List.of(recipe));
        return response;
    }
    
    private AdvancedRecipeRequestDTO.InventoryItemDTO mapToAdvancedInventoryItemDTO(Inventory inventory) {
        AdvancedRecipeRequestDTO.InventoryItemDTO dto = new AdvancedRecipeRequestDTO.InventoryItemDTO();
        dto.setName(inventory.getName());
        dto.setQuantity(inventory.getTotalQuantity());
        dto.setUnit(inventory.getUnit() != null ? inventory.getUnit().getName() : "pieces");
        
        // Check if expiring (this is a simplified check)
        dto.setIsExpiring(false); // Will be set properly by the calling method
        dto.setIsLowStock(inventory.getTotalQuantity() <= (inventory.getMinStock() != null ? inventory.getMinStock() : 0));
        
        return dto;
    }
}
