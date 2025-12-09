package com.innogent.pantry_mind.controller;

import com.innogent.pantry_mind.dto.response.RecipeResponseDTO;
import com.innogent.pantry_mind.service.RecipeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recipes")
@RequiredArgsConstructor
public class RecipeController {
    
    private final RecipeService recipeService;
    
    @GetMapping("/suggest/{kitchenId}")
    public ResponseEntity<RecipeResponseDTO> suggestRecipes(
            @PathVariable Long kitchenId,
            @RequestParam(defaultValue = "4") Integer servings) {
        
        System.out.println("📡 [BACKEND] Recipe API called for kitchenId: " + kitchenId + ", servings: " + servings);
        
        try {
            RecipeResponseDTO recipes = recipeService.generateRecipes(kitchenId, servings);
            System.out.println("🎉 [BACKEND] Recipes generated successfully, returning to frontend");
            return ResponseEntity.ok(recipes);
        } catch (Exception e) {
            System.err.println("❌ [BACKEND] Error in recipe controller: " + e.getMessage());
            throw e;
        }
    }
    
    @PostMapping("/consume/{kitchenId}")
    public ResponseEntity<Map<String, String>> consumeRecipeIngredients(
            @PathVariable Long kitchenId,
            @RequestBody List<String> ingredients) {
        
        try {
            recipeService.consumeIngredients(kitchenId, ingredients);
            return ResponseEntity.ok(Map.of("message", "Ingredients consumed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
