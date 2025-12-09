# python-backend/app/services/enhanced_recipe_service.py
from app.services.recipe_service import RecipeService
from app.models.recipe import RecipeRequest, RecipeResponse

class EnhancedRecipeService(RecipeService):
    
    def generate_low_stock_recipes(self, request: RecipeRequest) -> RecipeResponse:
        """Generate recipes specifically designed to use low-stock items"""
        
        # Identify low stock items
        low_stock_items = [item for item in request.items if item.quantity <= 5]
        
        if not low_stock_items:
            return self.generate_recipes(request)
        
        # Create specialized prompt for low stock items
        low_stock_names = [item.name for item in low_stock_items]
        
        prompt = f"""
        You are an expert Indian chef specializing in using up ingredients before they expire.
        
        PRIORITY: Create recipes that specifically use these LOW STOCK items: {', '.join(low_stock_names)}
        
        AVAILABLE INVENTORY:
        {self._format_inventory(request.items)}
        
        TARGET: {request.servings} servings
        
        REQUIREMENTS:
        1. MUST use at least 2-3 low stock items in each recipe
        2. Create recipes that help clear inventory efficiently
        3. Focus on Indian cuisine with authentic flavors
        4. Minimize waste and maximize usage of available items
        5. Provide storage tips for leftover ingredients
        
        Generate 4 recipes prioritizing low stock item usage.
        """
        
        return self._process_ai_recipe_request(prompt, request)
    
    def generate_seasonal_recipes(self, request: RecipeRequest, season: str) -> RecipeResponse:
        """Generate season-appropriate recipes"""
        
        seasonal_context = {
            "summer": "cooling, light, hydrating dishes with minimal cooking time",
            "monsoon": "warm, comforting, immunity-boosting dishes",
            "winter": "hearty, warming, rich dishes with longer cooking times",
            "spring": "fresh, detoxifying, light dishes with seasonal vegetables"
        }
        
        context = seasonal_context.get(season.lower(), "balanced, nutritious dishes")
        
        prompt = f"""
        Create {season} season recipes perfect for Indian households.
        Focus on {context}.
        
        AVAILABLE INVENTORY:
        {self._format_inventory(request.items)}
        
        SEASONAL REQUIREMENTS:
        - Use {season}-appropriate cooking methods
        - Include seasonal ingredients when possible
        - Consider weather and dietary needs for {season}
        - Provide 4 diverse recipes for {request.servings} servings
        """
        
        return self._process_ai_recipe_request(prompt, request)
