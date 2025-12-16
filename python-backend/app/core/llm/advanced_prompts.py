from typing import List, Dict, Any

class AdvancedRecipePrompts:
    
    @staticmethod
    def expiry_based_prompt(inventory_text: str, expiring_items: List[str], servings: int, preferences: Dict[str, Any]) -> str:
        skill_level = preferences.get('skill_level', 'INTERMEDIATE')
        max_time = preferences.get('max_cooking_time', 45)
        dietary_restrictions = preferences.get('dietary_restrictions', [])
        avoid_ingredients = preferences.get('avoid_ingredients', [])
        
        if not expiring_items:
            return f"""🚨 No expiring items found. Generate regular Indian recipes using available ingredients.

📦 Available Items: {inventory_text}
👥 Servings: {servings}

Generate 4 Indian recipes using available ingredients.

Return ONLY valid JSON:
{{
  "recipes": [
    {{
      "recipe_name": "Recipe Name",
      "inventory_items_used": [
        {{"name": "Item Name", "quantity": "250", "unit": "gm"}}
      ],
      "missing_items": [
        {{"name": "Salt", "quantity": "5", "unit": "gm"}}
      ],
      "steps": ["Step 1", "Step 2", "Step 3"]
    }}
  ]
}}

Units: gm, ml, pcs only."""
        
        return f"""🚨 URGENT FOOD WASTE PREVENTION: Generate recipes using EXPIRING ingredients FIRST!

========================================
🔴 EXPIRING ITEMS (USE IMMEDIATELY): {', '.join(expiring_items)}
📦 ALL AVAILABLE ITEMS: {inventory_text}
👥 SERVINGS: {servings}
========================================

### CRITICAL RULES - MUST FOLLOW:
1. 🔴 **TOP PRIORITY**: Every recipe MUST use at least 2-3 expiring items: {', '.join(expiring_items)}
2. 🥘 **CREATIVE USAGE**: For each expiring item, suggest multiple ways to use it in Indian cuisine
3. 🍛 **INGREDIENT FOCUS**: Build recipes around the specific expiring ingredients
4. ⚡ **QUICK METHODS**: Use fast cooking techniques to use items immediately
5. 🔄 **VERSATILE RECIPES**: Show different cooking styles for same ingredients

### RECIPE REQUIREMENTS:
- Each recipe must use AT LEAST 2 expiring items from the list
- Create recipes specifically designed around the expiring ingredients
- Focus on Indian cuisine that maximizes ingredient usage
- Provide quick cooking methods (under 30 minutes)
- Be creative with ingredient combinations

IMPORTANT: Generate recipes that specifically highlight and use the expiring items as main ingredients!

### RECIPE COMPLEXITY BY SKILL:
- BEGINNER: 3-4 steps, basic techniques, simple spices
- INTERMEDIATE: 5-6 steps, moderate techniques, balanced spices  
- ADVANCED: 6+ steps, complex techniques, sophisticated flavors

Return ONLY valid JSON with this exact structure:
{{
  "recipes": [
    {{
      "recipe_name": "Recipe Name",
      "inventory_items_used": [
        {{"name": "Item Name", "quantity": "250", "unit": "gm"}}
      ],
      "missing_items": [
        {{"name": "Missing Item", "quantity": "5", "unit": "ml", "need_to_buy": true}}
      ],
      "steps": ["Step 1", "Step 2"]
    }}
  ]
}}

IMPORTANT: Use ONLY these units - gm (grams), ml (milliliters), pcs (pieces). Convert all measurements:
- 1 cup = 240ml, 1 tbsp = 15ml, 1 tsp = 5ml
- 1 kg = 1000gm, solids in gm
- Count items use pcs (1 onion = 1 pcs)"""

    @staticmethod
    def quick_recipe_prompt(inventory_text: str, max_time: int, servings: int, preferences: Dict[str, Any]) -> str:
        skill_level = preferences.get('skill_level', 'INTERMEDIATE')
        spice_level = preferences.get('spice_level', 'MEDIUM')
        
        return f"""Generate 4 QUICK Indian recipes under {max_time} minutes.

========================================
AVAILABLE INVENTORY: {inventory_text}
MAX TIME: {max_time} minutes
SERVINGS: {servings}
SKILL LEVEL: {skill_level}
SPICE LEVEL: {spice_level}
========================================

### QUICK COOKING RULES:
1. **TIME LIMIT**: All recipes MUST be under {max_time} minutes
2. **TECHNIQUES**: Focus on stir-fry, steaming, pressure cooking
3. **PREP**: Minimal chopping and preparation
4. **SKILL**: Match {skill_level} complexity
5. **SPICE**: Use {spice_level} spice level

### QUICK COOKING TECHNIQUES:
- One-pot meals
- Stir-fries (5-10 mins)
- Pressure cooker recipes
- No-cook/minimal cook options
- Pre-cooked ingredient usage

Return ONLY valid JSON with this exact structure:
{{
  "recipes": [
    {{
      "recipe_name": "Recipe Name",
      "inventory_items_used": [
        {{"name": "Item Name", "quantity": "250", "unit": "gm"}}
      ],
      "missing_items": [
        {{"name": "Missing Item", "quantity": "5", "unit": "ml", "need_to_buy": true}}
      ],
      "steps": ["Step 1", "Step 2"]
    }}
  ]
}}

IMPORTANT: Use ONLY these units - gm (grams), ml (milliliters), pcs (pieces). Convert all measurements:
- 1 cup = 240ml, 1 tbsp = 15ml, 1 tsp = 5ml
- 1 kg = 1000gm, solids in gm
- Count items use pcs (1 onion = 1 pcs)"""

    @staticmethod
    def skill_based_prompt(inventory_text: str, skill_level: str, servings: int, preferences: Dict[str, Any]) -> str:
        max_time = preferences.get('max_cooking_time', 45)
        cuisine_prefs = preferences.get('cuisine_preferences', ['Indian'])
        
        skill_instructions = {
            "BEGINNER": {
                "complexity": "Simple 3-4 step recipes with basic techniques",
                "techniques": "Boiling, basic frying, steaming, mixing",
                "spices": "Common spices only (turmeric, salt, red chili)",
                "time": "15-25 minutes maximum"
            },
            "INTERMEDIATE": {
                "complexity": "5-6 step recipes with moderate techniques", 
                "techniques": "Tempering, sautéing, pressure cooking, basic curry making",
                "spices": "Moderate spice combinations (cumin, coriander, garam masala)",
                "time": "25-45 minutes"
            },
            "ADVANCED": {
                "complexity": "Complex 6+ step recipes with sophisticated techniques",
                "techniques": "Advanced tempering, layered cooking, complex gravies, fermentation",
                "spices": "Complex spice blends and techniques",
                "time": "45+ minutes allowed"
            }
        }
        
        instructions = skill_instructions.get(skill_level, skill_instructions["INTERMEDIATE"])
        
        return f"""Generate 4 Indian recipes for {skill_level} skill level cook.

========================================
AVAILABLE INVENTORY: {inventory_text}
SKILL LEVEL: {skill_level}
SERVINGS: {servings}
MAX TIME: {max_time} minutes
CUISINE PREFERENCES: {cuisine_prefs}
========================================

### {skill_level} COOKING GUIDELINES:
- COMPLEXITY: {instructions['complexity']}
- TECHNIQUES: {instructions['techniques']}
- SPICES: {instructions['spices']}
- TIME: {instructions['time']}

### RECIPE REQUIREMENTS:
1. Match {skill_level} complexity exactly
2. Use appropriate cooking techniques
3. Include skill-appropriate tips
4. Provide clear, level-appropriate instructions

Return ONLY valid JSON with this exact structure:
{{
  "recipes": [
    {{
      "recipe_name": "Recipe Name",
      "inventory_items_used": [
        {{"name": "Item Name", "quantity": "250", "unit": "gm"}}
      ],
      "missing_items": [
        {{"name": "Missing Item", "quantity": "5", "unit": "ml", "need_to_buy": true}}
      ],
      "steps": ["Step 1", "Step 2"]
    }}
  ]
}}

IMPORTANT: Use ONLY these units - gm (grams), ml (milliliters), pcs (pieces). Convert all measurements:
- 1 cup = 240ml, 1 tbsp = 15ml, 1 tsp = 5ml
- 1 kg = 1000gm, solids in gm
- Count items use pcs (1 onion = 1 pcs)"""

    @staticmethod
    def wastage_prevention_prompt(inventory_text: str, low_stock_items: List[str], expiring_items: List[str], servings: int) -> str:
        return f"""Generate 4 WASTAGE PREVENTION recipes using surplus and expiring ingredients.

========================================
EXPIRING SOON: {', '.join(expiring_items)}
LOW STOCK ITEMS: {', '.join(low_stock_items)}
AVAILABLE INVENTORY: {inventory_text}
SERVINGS: {servings}
========================================

### WASTAGE PREVENTION STRATEGY:
1. **PRIORITY 1**: Use ALL expiring ingredients: {', '.join(expiring_items)}
2. **PRIORITY 2**: Preserve low stock items: {', '.join(low_stock_items)}
3. **BULK COOKING**: Recipes that can be stored/frozen
4. **PRESERVATION**: Include preservation tips
5. **LEFTOVER USAGE**: Creative leftover integration

### FOCUS AREAS:
- Large batch cooking
- Preservation techniques (pickling, drying)
- Freezer-friendly recipes
- Multi-meal preparations
- Creative ingredient combinations

Return ONLY valid JSON with this exact structure:
{{
  "recipes": [
    {{
      "recipe_name": "Recipe Name",
      "inventory_items_used": [
        {{"name": "Item Name", "quantity": "250", "unit": "gm"}}
      ],
      "missing_items": [
        {{"name": "Missing Item", "quantity": "5", "unit": "ml", "need_to_buy": true}}
      ],
      "steps": ["Step 1", "Step 2"]
    }}
  ]
}}

IMPORTANT: Use ONLY these units - gm (grams), ml (milliliters), pcs (pieces). Convert all measurements:
- 1 cup = 240ml, 1 tbsp = 15ml, 1 tsp = 5ml
- 1 kg = 1000gm, solids in gm
- Count items use pcs (1 onion = 1 pcs)"""

    @staticmethod
    def personalized_prompt(inventory_text: str, servings: int, preferences: Dict[str, Any], recipe_history: List[str] = []) -> str:
        dietary_restrictions = preferences.get('dietary_restrictions', [])
        cuisine_prefs = preferences.get('cuisine_preferences', ['Indian'])
        skill_level = preferences.get('skill_level', 'INTERMEDIATE')
        spice_level = preferences.get('spice_level', 'MEDIUM')
        max_time = preferences.get('max_cooking_time', 45)
        avoid_ingredients = preferences.get('avoid_ingredients', [])
        
        return f"""Generate 4 PERSONALIZED Indian recipes based on user preferences and history.

========================================
AVAILABLE INVENTORY: {inventory_text}
SERVINGS: {servings}
DIETARY RESTRICTIONS: {dietary_restrictions}
CUISINE PREFERENCES: {cuisine_prefs}
SKILL LEVEL: {skill_level}
SPICE LEVEL: {spice_level}
MAX COOKING TIME: {max_time} minutes
AVOID INGREDIENTS: {avoid_ingredients}
RECENT RECIPES: {recipe_history[-5:] if recipe_history else 'None'}
========================================

### PERSONALIZATION RULES:
1. **DIETARY**: Strictly follow restrictions: {dietary_restrictions}
2. **CUISINE**: Focus on preferences: {cuisine_prefs}
3. **SKILL**: Match {skill_level} complexity
4. **SPICE**: Use {spice_level} spice level
5. **AVOID**: Never suggest: {avoid_ingredients}
6. **VARIETY**: Avoid recent recipes: {recipe_history[-5:] if recipe_history else 'None'}

### SPICE LEVEL GUIDE:
- MILD: Minimal spices, kid-friendly
- MEDIUM: Balanced, moderate heat
- SPICY: Good heat, adult preference
- EXTRA_SPICY: Very hot, spice lovers

Return ONLY valid JSON with this exact structure:
{{
  "recipes": [
    {{
      "recipe_name": "Recipe Name",
      "inventory_items_used": [
        {{"name": "Item Name", "quantity": "250", "unit": "gm"}}
      ],
      "missing_items": [
        {{"name": "Missing Item", "quantity": "5", "unit": "ml", "need_to_buy": true}}
      ],
      "steps": ["Step 1", "Step 2"]
    }}
  ]
}}

IMPORTANT: Use ONLY these units - gm (grams), ml (milliliters), pcs (pieces). Convert all measurements:
- 1 cup = 240ml, 1 tbsp = 15ml, 1 tsp = 5ml
- 1 kg = 1000gm, solids in gm
- Count items use pcs (1 onion = 1 pcs)"""