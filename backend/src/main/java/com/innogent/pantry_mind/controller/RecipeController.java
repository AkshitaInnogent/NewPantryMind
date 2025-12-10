package com.innogent.pantry_mind.controller;

import com.innogent.pantry_mind.dto.request.AdvancedRecipeRequestDTO;
import com.innogent.pantry_mind.dto.response.RecipeResponseDTO;
import com.innogent.pantry_mind.service.RecipeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recipes")
@RequiredArgsConstructor
public class RecipeController {
    
    private final RecipeService recipeService;
    
    @GetMapping("/suggest/{kitchenId}")
    public ResponseEntity<RecipeResponseDTO> suggestRecipes(
            @PathVariable Long kitchenId,
            @RequestParam(defaultValue = "4") Integer servings,
            @RequestParam(required = false) String category) {
        
        System.out.println("📡 [BACKEND] Recipe API called for kitchenId: " + kitchenId + ", servings: " + servings + ", category: " + category);
        
        try {
            RecipeResponseDTO recipes = recipeService.generateRecipes(kitchenId, servings, category);
            System.out.println("🎉 [BACKEND] Recipes generated successfully, returning to frontend");
            return ResponseEntity.ok(recipes);
        } catch (Exception e) {
            System.err.println("❌ [BACKEND] Error in recipe controller: " + e.getMessage());
            throw e;
        }
    }
    
    @PostMapping("/advanced/{kitchenId}")
    public ResponseEntity<RecipeResponseDTO> generateAdvancedRecipes(
            @PathVariable Long kitchenId,
            @RequestBody AdvancedRecipeRequestDTO request) {
        
        System.out.println("🚀 [BACKEND] Advanced recipe API called for kitchenId: " + kitchenId);
        System.out.println("📋 [BACKEND] Recipe type: " + request.getRecipeType());
        
        try {
            RecipeResponseDTO recipes = recipeService.generateAdvancedRecipes(kitchenId, request);
            System.out.println("🎉 [BACKEND] Advanced recipes generated successfully");
            return ResponseEntity.ok(recipes);
        } catch (Exception e) {
            System.err.println("❌ [BACKEND] Error in advanced recipe controller: " + e.getMessage());
            throw e;
        }
    }
    
    @GetMapping("/expiring/{kitchenId}")
    public ResponseEntity<RecipeResponseDTO> getExpiryBasedRecipes(
            @PathVariable Long kitchenId,
            @RequestParam(defaultValue = "4") Integer servings,
            @RequestParam(required = false) Long userId) {
        
        System.out.println("⏰ [BACKEND] Expiry-based recipe API called for kitchenId: " + kitchenId);
        
        try {
            RecipeResponseDTO recipes = recipeService.generateExpiryBasedRecipes(kitchenId, servings, userId);
            return ResponseEntity.ok(recipes);
        } catch (Exception e) {
            System.err.println("❌ [BACKEND] Error in expiry-based recipe controller: " + e.getMessage());
            throw e;
        }
    }
    
    @GetMapping("/quick/{kitchenId}")
    public ResponseEntity<RecipeResponseDTO> getQuickRecipes(
            @PathVariable Long kitchenId,
            @RequestParam(defaultValue = "30") Integer maxTime,
            @RequestParam(defaultValue = "4") Integer servings,
            @RequestParam(required = false) Long userId) {
        
        System.out.println("⚡ [BACKEND] Quick recipe API called for kitchenId: " + kitchenId + ", maxTime: " + maxTime);
        
        try {
            RecipeResponseDTO recipes = recipeService.generateQuickRecipes(kitchenId, maxTime, servings, userId);
            return ResponseEntity.ok(recipes);
        } catch (Exception e) {
            System.err.println("❌ [BACKEND] Error in quick recipe controller: " + e.getMessage());
            throw e;
        }
    }
    
    @GetMapping("/by-name/{kitchenId}")
    public ResponseEntity<RecipeResponseDTO> getRecipeByName(
            @PathVariable Long kitchenId,
            @RequestParam String recipeName,
            @RequestParam(defaultValue = "4") Integer servings) {
        
        System.out.println("🍳 [BACKEND] Recipe by name API called: " + recipeName);
        
        try {
            RecipeResponseDTO recipes = recipeService.generateRecipeByName(kitchenId, recipeName, servings);
            return ResponseEntity.ok(recipes);
        } catch (Exception e) {
            System.err.println("❌ [BACKEND] Recipe by name error: " + e.getMessage());
            throw e;
        }
    }

}
