package com.innogent.pantry_mind.controller;

import com.innogent.pantry_mind.dto.response.ShoppingListItemResponseDTO;
import com.innogent.pantry_mind.dto.response.RecipeResponseDTO;
import com.innogent.pantry_mind.service.AIService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI Services", description = "AI-powered features for smart pantry management")
public class AIController {

    private final AIService aiService;

    @PostMapping("/shopping-suggestions")
    @Operation(summary = "Get AI-powered shopping suggestions", 
               description = "Generate intelligent shopping suggestions based on inventory analysis and consumption patterns")
    public ResponseEntity<List<ShoppingListItemResponseDTO>> getAISuggestions(
            @RequestBody Map<String, Object> request) {
        try {
            Long kitchenId = Long.valueOf(request.get("kitchenId").toString());
            List<ShoppingListItemResponseDTO> suggestions = aiService.generateAISuggestions(kitchenId);
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }
    }

    @PostMapping("/analyze-consumption")
    @Operation(summary = "Analyze consumption patterns with AI", 
               description = "Analyze household consumption patterns and provide insights for better inventory management")
    public ResponseEntity<Map<String, Object>> analyzeConsumption(
            @RequestBody Map<String, Object> request) {
        try {
            Long kitchenId = Long.valueOf(request.get("kitchenId").toString());
            Map<String, Object> analysis = aiService.analyzeConsumptionPatterns(kitchenId);
            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to analyze consumption patterns");
            errorResponse.put("analysisType", "ERROR");
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/seasonal-recipes")
    @Operation(summary = "Generate seasonal recipes", 
               description = "Generate season-appropriate recipes based on available inventory and weather conditions")
    public ResponseEntity<RecipeResponseDTO> generateSeasonalRecipes(
            @RequestBody Map<String, Object> request) {
        try {
            Long kitchenId = Long.valueOf(request.get("kitchenId").toString());
            String season = request.get("season").toString();
            Integer servings = Integer.valueOf(request.get("servings").toString());
            
            RecipeResponseDTO recipes = aiService.generateSeasonalRecipes(kitchenId, season, servings);
            return ResponseEntity.ok(recipes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new RecipeResponseDTO());
        }
    }

    @PostMapping("/low-stock-recipes")
    @Operation(summary = "Generate recipes for low stock items", 
               description = "Create recipes specifically designed to use up low stock and expiring items")
    public ResponseEntity<RecipeResponseDTO> generateLowStockRecipes(
            @RequestBody Map<String, Object> request) {
        try {
            Long kitchenId = Long.valueOf(request.get("kitchenId").toString());
            Integer servings = Integer.valueOf(request.get("servings").toString());
            
            RecipeResponseDTO recipes = aiService.generateLowStockRecipes(kitchenId, servings);
            return ResponseEntity.ok(recipes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new RecipeResponseDTO());
        }
    }

    @PostMapping("/recipe-recommendations")
    @Operation(summary = "Get smart recipe recommendations", 
               description = "Get AI-powered recipe name recommendations based on available inventory")
    public ResponseEntity<Map<String, Object>> getRecipeRecommendations(
            @RequestBody Map<String, Object> request) {
        try {
            Long kitchenId = Long.valueOf(request.get("kitchenId").toString());
            Integer servings = Integer.valueOf(request.get("servings").toString());
            
            List<String> recommendations = aiService.generateSmartRecipeRecommendations(kitchenId, servings);
            
            Map<String, Object> response = new HashMap<>();
            response.put("recommendations", recommendations);
            response.put("count", recommendations.size());
            response.put("aiPowered", aiService.isAIAvailable());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("recommendations", Arrays.asList("Basic Rice", "Simple Soup"));
            errorResponse.put("error", "Failed to generate recommendations");
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/status")
    @Operation(summary = "Check AI service status", 
               description = "Get current status of AI services and available features")
    public ResponseEntity<Map<String, Object>> getAIStatus() {
        Map<String, Object> status = new HashMap<>();
        boolean aiAvailable = aiService.isAIAvailable();
        
        status.put("aiAvailable", aiAvailable);
        status.put("status", aiAvailable ? "ONLINE" : "OFFLINE");
        status.put("features", Arrays.asList(
            "Smart Shopping Suggestions",
            "Consumption Pattern Analysis", 
            "Seasonal Recipe Recommendations",
            "Low Stock Recipe Generation",
            "Recipe Name Recommendations"
        ));
        status.put("fallbackMode", !aiAvailable);
        status.put("timestamp", new Date());
        
        return ResponseEntity.ok(status);
    }

    @GetMapping("/health")
    @Operation(summary = "AI service health check", 
               description = "Simple health check endpoint for AI services")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> health = new HashMap<>();
        health.put("status", "healthy");
        health.put("service", "AI Controller");
        health.put("timestamp", new Date().toString());
        
        return ResponseEntity.ok(health);
    }
}
