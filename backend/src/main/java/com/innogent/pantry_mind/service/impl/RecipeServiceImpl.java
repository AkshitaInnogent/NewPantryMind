package com.innogent.pantry_mind.service.impl;

import com.innogent.pantry_mind.dto.response.RecipeResponseDTO;
import com.innogent.pantry_mind.entity.*;
import com.innogent.pantry_mind.repository.*;
import com.innogent.pantry_mind.service.RecipeService;
import com.innogent.pantry_mind.util.NameNormalizationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class RecipeServiceImpl implements RecipeService {
    
    private final InventoryRepository inventoryRepository;
    private final ConsumptionEventRepository consumptionRepository;
    private final KitchenRepository kitchenRepository;
    
    @Override
    public RecipeResponseDTO generateRecipes(Long kitchenId, Integer servings) {
        List<Inventory> inventory = inventoryRepository.findByKitchenId(kitchenId);
        
        if (inventory.isEmpty()) {
            return createEmptyResponse();
        }
        
        List<RecipeResponseDTO.Recipe> recipes = new ArrayList<>();
        
        // Generate recipes based on available inventory
        for (Inventory item : inventory) {
            if (item.getTotalQuantity() > 0) {
                RecipeResponseDTO.Recipe recipe = createRecipeForItem(item, inventory, servings);
                if (recipe != null) {
                    recipes.add(recipe);
                }
                if (recipes.size() >= 4) break; // Limit to 4 recipes
            }
        }
        
        // If no recipes generated, create a basic recipe with available items
        if (recipes.isEmpty()) {
            recipes.add(createBasicRecipe(inventory, servings));
        }
        
        RecipeResponseDTO response = new RecipeResponseDTO();
        response.setRecipes(recipes);
        return response;
    }
    
    private RecipeResponseDTO.Recipe createRecipeForItem(Inventory mainItem, List<Inventory> allInventory, Integer servings) {
        String itemName = mainItem.getName().toLowerCase();
        
        RecipeResponseDTO.Recipe recipe = new RecipeResponseDTO.Recipe();
        recipe.setServings(servings);
        recipe.setMissingItems(new ArrayList<>());
        
        List<String> ingredients = new ArrayList<>();
        List<String> steps = new ArrayList<>();
        
        // Calculate base quantity based on servings
        long baseQuantity = Math.max(1, servings * getBaseQuantityPerServing(mainItem));
        ingredients.add(getIngredientWithUnit(mainItem, baseQuantity));
        
        if (itemName.contains("rice")) {
            recipe.setName("Rice Dish");
            recipe.setCookingTime("25 mins");
            addCommonIngredients(ingredients, allInventory, servings);
            steps.addAll(Arrays.asList(
                "Wash and soak rice for 10 minutes",
                "Heat oil in a pan",
                "Add spices and cook for 1 minute",
                "Add rice and water, bring to boil",
                "Cover and cook on low heat until done"
            ));
        } else if (itemName.contains("pasta") || itemName.contains("noodle")) {
            recipe.setName("Pasta Dish");
            recipe.setCookingTime("20 mins");
            addCommonIngredients(ingredients, allInventory, servings);
            steps.addAll(Arrays.asList(
                "Boil water in a large pot",
                "Add pasta and cook until al dente",
                "Heat oil in another pan",
                "Add vegetables and cook",
                "Mix pasta with vegetables and serve"
            ));
        } else if (itemName.contains("egg")) {
            recipe.setName("Egg Curry");
            recipe.setCookingTime("30 mins");
            addCommonIngredients(ingredients, allInventory, servings);
            steps.addAll(Arrays.asList(
                "Boil eggs and peel them",
                "Heat oil in a pan",
                "Add onions and cook until golden",
                "Add tomatoes and spices",
                "Add eggs and simmer for 10 minutes"
            ));
        } else if (itemName.contains("chicken") || itemName.contains("meat")) {
            recipe.setName("Meat Curry");
            recipe.setCookingTime("45 mins");
            addCommonIngredients(ingredients, allInventory, servings);
            steps.addAll(Arrays.asList(
                "Clean and cut meat into pieces",
                "Heat oil in a heavy-bottomed pan",
                "Add meat and cook until browned",
                "Add vegetables and spices",
                "Cover and cook until meat is tender"
            ));
        } else {
            recipe.setName(capitalizeFirst(mainItem.getName()) + " Recipe");
            recipe.setCookingTime("20 mins");
            addCommonIngredients(ingredients, allInventory, servings);
            steps.addAll(Arrays.asList(
                "Prepare all ingredients",
                "Heat oil in a pan",
                "Add main ingredient and cook",
                "Season with salt and spices",
                "Cook until done and serve hot"
            ));
        }
        
        recipe.setIngredients(ingredients);
        recipe.setSteps(steps);
        return recipe;
    }
    
    private void addCommonIngredients(List<String> ingredients, List<Inventory> inventory, Integer servings) {
        // Add oil if available
        Inventory oil = findInventoryByName(inventory, "oil");
        if (oil != null) {
            ingredients.add(getIngredientWithUnit(oil, servings * 10)); // 10 units per serving
        }
        
        // Add onion if available
        Inventory onion = findInventoryByName(inventory, "onion");
        if (onion != null) {
            ingredients.add(getIngredientWithUnit(onion, Math.max(1, servings / 2)));
        }
        
        // Add tomato if available
        Inventory tomato = findInventoryByName(inventory, "tomato");
        if (tomato != null) {
            ingredients.add(getIngredientWithUnit(tomato, servings));
        }
        
        // Add garlic if available
        Inventory garlic = findInventoryByName(inventory, "garlic");
        if (garlic != null) {
            ingredients.add(getIngredientWithUnit(garlic, servings * 5));
        }
        
        // Always add salt
        ingredients.add("Salt to taste");
    }
    
    private RecipeResponseDTO.Recipe createBasicRecipe(List<Inventory> inventory, Integer servings) {
        RecipeResponseDTO.Recipe recipe = new RecipeResponseDTO.Recipe();
        recipe.setName("Mixed Ingredient Dish");
        recipe.setServings(servings);
        recipe.setCookingTime("25 mins");
        recipe.setMissingItems(new ArrayList<>());
        
        List<String> ingredients = new ArrayList<>();
        
        // Add up to 5 available ingredients
        inventory.stream()
            .filter(item -> item.getTotalQuantity() > 0)
            .limit(5)
            .forEach(item -> ingredients.add(getIngredientWithUnit(item, Math.max(1, servings))));
        
        ingredients.add("Salt and spices to taste");
        
        recipe.setIngredients(ingredients);
        recipe.setSteps(Arrays.asList(
            "Prepare all available ingredients",
            "Heat oil in a large pan",
            "Add ingredients one by one",
            "Season with salt and spices",
            "Cook until everything is well combined",
            "Serve hot"
        ));
        
        return recipe;
    }
    
    private long getBaseQuantityPerServing(Inventory item) {
        String unitName = item.getUnit() != null ? item.getUnit().getName().toLowerCase() : "pieces";
        String itemName = item.getName().toLowerCase();
        
        // Adjust quantity based on unit and item type
        if (unitName.contains("gram") || unitName.contains("gm")) {
            if (itemName.contains("rice") || itemName.contains("pasta")) return 100; // 100g per serving
            if (itemName.contains("meat") || itemName.contains("chicken")) return 150; // 150g per serving
            return 50; // Default 50g per serving
        } else if (unitName.contains("liter") || unitName.contains("ml")) {
            return 50; // 50ml per serving
        } else {
            return 1; // 1 piece per serving
        }
    }
    
    private String capitalizeFirst(String str) {
        if (str == null || str.isEmpty()) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }
    
    private RecipeResponseDTO createEmptyResponse() {
        RecipeResponseDTO response = new RecipeResponseDTO();
        response.setRecipes(new ArrayList<>());
        return response;
    }
    
    private Inventory findInventoryByName(List<Inventory> inventory, String name) {
        return inventory.stream()
            .filter(item -> item.getName().toLowerCase().contains(name.toLowerCase()) 
                && item.getTotalQuantity() > 0)
            .findFirst()
            .orElse(null);
    }
    
    private String getIngredientWithUnit(Inventory item, long quantity) {
        if (item == null) {
            return "Item not available";
        }
        String unitName = item.getUnit() != null ? item.getUnit().getName() : "pieces";
        return quantity + " " + unitName + " " + item.getName();
    }
    
    @Override
    @Transactional
    public void consumeIngredients(Long kitchenId, List<String> ingredients) {
        Kitchen kitchen = kitchenRepository.findById(kitchenId)
            .orElseThrow(() -> new RuntimeException("Kitchen not found"));
        
        for (String ingredient : ingredients) {
            try {
                System.out.println("Processing ingredient: " + ingredient);
                
                // Skip ingredients with "to taste" or other non-numeric quantities
                if (ingredient.toLowerCase().contains("to taste") || 
                    ingredient.toLowerCase().contains("as needed") ||
                    ingredient.toLowerCase().contains("pinch")) {
                    System.out.println("Skipping non-measurable ingredient: " + ingredient);
                    continue;
                }
                
                String[] parts = ingredient.trim().split("\\s+", 3);
                if (parts.length < 3) continue;
                
                String quantityStr = parts[0];
                String unitName = parts[1];
                String itemName = parts[2];
                
                // Validate quantity is numeric
                if (!isNumeric(quantityStr)) {
                    System.out.println("Skipping non-numeric quantity: " + quantityStr);
                    continue;
                }
                
                BigDecimal quantity = new BigDecimal(quantityStr);
                
                Inventory inventory = inventoryRepository.findByNameAndKitchenId(itemName, kitchenId);
                
                if (inventory != null) {
                    System.out.println("Found inventory: " + inventory.getName() + " with quantity: " + inventory.getTotalQuantity());
                    
                    Long currentQty = inventory.getTotalQuantity();
                    Long newQuantity = Math.max(0, currentQty - quantity.longValue());
                    inventory.setTotalQuantity(newQuantity);
                    inventoryRepository.save(inventory);
                    
                    System.out.println("Updated quantity from " + currentQty + " to " + newQuantity);
                    
                    ConsumptionEvent event = ConsumptionEvent.builder()
                        .canonicalName(NameNormalizationUtil.normalizeName(inventory.getName()))
                        .quantityConsumed(quantity)
                        .unit(inventory.getUnit())
                        .kitchen(kitchen)
                        .reason(ConsumptionEvent.EventReason.RECIPE_COOKED)
                        .build();
                    
                    consumptionRepository.save(event);
                } else {
                    System.out.println("No inventory found for: " + itemName);
                }
            } catch (Exception e) {
                System.err.println("Error processing ingredient: " + ingredient + " - " + e.getMessage());
                e.printStackTrace();
            }
        }
    }
    
    private boolean isNumeric(String str) {
        try {
            new BigDecimal(str);
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }
}
