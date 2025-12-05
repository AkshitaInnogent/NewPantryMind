package com.innogent.pantry_mind.service.impl;

import com.innogent.pantry_mind.dto.request.RecipeRequestDTO;
import com.innogent.pantry_mind.dto.response.RecipeResponseDTO;
import com.innogent.pantry_mind.entity.Inventory;
import com.innogent.pantry_mind.repository.InventoryRepository;
import com.innogent.pantry_mind.service.RecipeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecipeServiceImpl implements RecipeService {
    
    private final InventoryRepository inventoryRepository;
    private final RestTemplate restTemplate;
    
    @Override
    public RecipeResponseDTO generateRecipes(Long kitchenId, Integer servings) {
        System.out.println("🚀 [BACKEND] Recipe generation started for kitchenId: " + kitchenId + ", servings: " + servings);
        
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
            System.out.println("🤖 [BACKEND] Calling AI service at http://localhost:8001/ai/recipes");
            System.out.println("📤 [BACKEND] Request payload:");
            System.out.println("   Items count: " + request.getItems().size());
            System.out.println("   Servings: " + request.getServings());
            
            RecipeResponseDTO response = restTemplate.postForObject("http://localhost:8001/ai/recipes", request, RecipeResponseDTO.class);
            
            if (response != null && response.getRecipes() != null) {
                System.out.println("✅ [BACKEND] AI service responded successfully!");
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
            System.err.println("🔄 [BACKEND] Falling back to default recipes");
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
        
        // Create 4 fallback recipes
        RecipeResponseDTO.Recipe recipe1 = new RecipeResponseDTO.Recipe();
        recipe1.setName("Simple Stir Fry");
        recipe1.setIngredients(List.of("Available vegetables: as needed", "Oil: 30 ml"));
        recipe1.setMissingItems(List.of("Soy sauce: 15 ml"));
        recipe1.setSteps(List.of("Heat oil", "Add vegetables", "Stir fry for 5 mins"));
        recipe1.setServings(servings);
        recipe1.setCookingTime("15 mins");
        
        RecipeResponseDTO.Recipe recipe2 = new RecipeResponseDTO.Recipe();
        recipe2.setName("Basic Rice Bowl");
        recipe2.setIngredients(List.of("Rice: 200 gm", "Available ingredients: as needed"));
        recipe2.setMissingItems(List.of("Spices: 5 gm"));
        recipe2.setSteps(List.of("Cook rice", "Mix with ingredients"));
        recipe2.setServings(servings);
        recipe2.setCookingTime("20 mins");
        
        RecipeResponseDTO.Recipe recipe3 = new RecipeResponseDTO.Recipe();
        recipe3.setName("Quick Soup");
        recipe3.setIngredients(List.of("Water: 500 ml", "Available vegetables: as needed"));
        recipe3.setMissingItems(List.of("Stock cubes: 1 pieces"));
        recipe3.setSteps(List.of("Boil water", "Add vegetables", "Simmer"));
        recipe3.setServings(servings);
        recipe3.setCookingTime("25 mins");
        
        RecipeResponseDTO.Recipe recipe4 = new RecipeResponseDTO.Recipe();
        recipe4.setName("Simple Salad");
        recipe4.setIngredients(List.of("Fresh vegetables: as needed"));
        recipe4.setMissingItems(List.of("Dressing: 30 ml"));
        recipe4.setSteps(List.of("Chop vegetables", "Mix together"));
        recipe4.setServings(servings);
        recipe4.setCookingTime("10 mins");
        
        response.setRecipes(List.of(recipe1, recipe2, recipe3, recipe4));
        
        System.out.println("✅ [BACKEND] Created 4 fallback recipes");
        return response;
    }
}