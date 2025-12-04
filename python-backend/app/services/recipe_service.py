from groq import Groq
import json
import os
from dotenv import load_dotenv
from app.models.recipe import RecipeRequest, RecipeResponse, Recipe

load_dotenv()

class RecipeService:
    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    
    def generate_recipes(self, request: RecipeRequest) -> RecipeResponse:
        # Create inventory summary
        inventory_summary = []
        for item in request.items:
            unit = self._standardize_unit(item.unit, item.quantity)
            inventory_summary.append(f"- {item.name}: {unit['quantity']} {unit['unit']}")
        
        inventory_text = "\n".join(inventory_summary)
        
        # Get available item names for strict checking
        available_items = [item.name for item in request.items]
        
        prompt = f"""You are an expert Indian recipe generator.
Generate 4 different Indian recipes based strictly on the user's inventory.

========================================
INVENTORY DATA (Important):
{inventory_text}

TARGET SERVINGS: {request.servings}
========================================

### CRITICAL RULES FOR ALL 4 RECIPES

1. **INVENTORY ITEMS USAGE**
   - Available items: {', '.join(available_items)}
   - Calculate realistic quantities for {request.servings} person(s)
   - Per person portions: Rice 100-150g, Milk 200ml, Sugar 20-30g, Salt 2-5g, Banana 1-2 pcs
   - If inventory item is used, it MUST go in "inventory_items_used" ONLY
   - NEVER put inventory items in "missing_items"

2. **MISSING INGREDIENTS**
   - Only add items NOT in inventory: {', '.join(available_items)}
   - Use realistic quantities for {request.servings} person(s)
   - Common Indian ingredients: Oil 15ml, Onion 1 pcs, Garlic 5g, Ginger 5g, Cumin 2g, Turmeric 2g, etc.
   - DO NOT suggest basic items like Water, as they are assumed available

3. **QUANTITY CALCULATION FOR {request.servings} PERSON(S)**
   - Rice: {100 * request.servings}-{150 * request.servings}g
   - Milk: {200 * request.servings}ml  
   - Sugar: {20 * request.servings}-{30 * request.servings}g
   - Salt: {2 * request.servings}-{5 * request.servings}g
   - Banana: {1 * request.servings}-{2 * request.servings} pcs

4. **STRICT INVENTORY CHECK**
   - These items MUST ONLY appear in "inventory_items_used": {', '.join(available_items)}
   - These items MUST NEVER appear in "missing_items": {', '.join(available_items)}

5. **UNITS ALLOWED**
   - g (grams)
   - ml (milliliters)
   - pcs (pieces)

6. **OUTPUT RULES**
   - Valid JSON only
   - No explanations
   - 4 different Indian recipes with authentic names (like Dal Tadka, Jeera Rice, etc.)
   - Focus on popular Indian dishes and cooking techniques
   - Realistic cooking quantities

### RETURN EXACTLY IN THIS JSON FORMAT:

{{
  "recipes": [
    {{
      "recipe_name": "",
      "inventory_items_used": [
        {{ "name": "", "quantity": "", "unit": "" }}
      ],
      "missing_items": [
        {{ "name": "", "quantity": "", "unit": "" }}
      ],
      "steps": [
        "Step 1 ...",
        "Step 2 ...",
        "Step 3 ...",
        "Step 4 ...",
        "Step 5 ..."
      ]
    }},
    {{
      "recipe_name": "",
      "inventory_items_used": [],
      "missing_items": [],
      "steps": []
    }},
    {{
      "recipe_name": "",
      "inventory_items_used": [],
      "missing_items": [],
      "steps": []
    }},
    {{
      "recipe_name": "",
      "inventory_items_used": [],
      "missing_items": [],
      "steps": []
    }}
  ]
}}"""
        
        try:
            print(f"🤖 [PYTHON] Calling Groq AI for {request.servings} people...")
            print(f"📋 [PYTHON] Inventory summary sent to AI:")
            for item in inventory_summary:
                print(f"   {item}")
            
            response = self.client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=4000
            )
            content = response.choices[0].message.content.strip()
            
            print(f"🤖 [PYTHON] Groq Response length: {len(content)} chars")
            
            # Clean response
            if content.startswith('```json'):
                content = content[7:]
            if content.endswith('```'):
                content = content[:-3]
            content = content.strip()
            
            # Find JSON boundaries
            start = content.find('{')
            end = content.rfind('}') + 1
            
            if start == -1 or end == 0:
                raise ValueError("No valid JSON found in response")
                
            json_content = content[start:end]
            data = json.loads(json_content)
            
            print(f"✅ [PYTHON] Successfully parsed {len(data.get('recipes', []))} recipes")
            
            # Convert to our response format
            converted_recipes = []
            
            # Get available item names for filtering
            available_item_names = [item.name.lower().strip() for item in request.items]
            print(f" [PYTHON] Available inventory items: {available_item_names}")
            
            for i, recipe_data in enumerate(data.get('recipes', [])):
                print(f" [PYTHON] Processing recipe {i+1}: {recipe_data.get('recipe_name', 'Unknown')}")
                
                # Convert inventory_items_used to ingredients format
                ingredients = []
                for item in recipe_data.get('inventory_items_used', []):
                    name = str(item.get('name', '')).strip()
                    quantity = str(item.get('quantity', '')).strip()
                    unit = str(item.get('unit', '')).strip()
                    
                    # Clean quantity+unit to avoid duplicates like "100gg" or "5mlml"
                    quantity_unit = f"{quantity}{unit}"
                    # Remove duplicate units
                    quantity_unit = quantity_unit.replace('gg', 'g').replace('mlml', 'ml').replace('pcspcs', 'pcs').replace('pcpcs', 'pcs')
                    
                    ingredient_text = f"{name}: {quantity_unit}"
                    ingredients.append(ingredient_text)
                    print(f"    Using: {ingredient_text}")
                
                # Convert missing_items format and filter out inventory items
                missing_items = []
                # Common household items that should not appear in shopping list
                common_items = ['water', 'ice', 'air', 'steam']
                
                for item in recipe_data.get('missing_items', []):
                    name = str(item.get('name', '')).strip()
                    quantity = str(item.get('quantity', '')).strip()
                    unit = str(item.get('unit', '')).strip()
                    
                    # Check if this item is already in inventory (case-insensitive)
                    if name.lower() in available_item_names:
                        print(f"    [PYTHON] Skipping '{name}' from missing items - already in inventory")
                        continue
                    
                    # Check if this is a common household item
                    if name.lower() in common_items:
                        print(f"    [PYTHON] Skipping '{name}' from missing items - common household item")
                        continue
                    
                    # Clean quantity+unit to avoid duplicates like "5mlml" or "100gg"
                    quantity_unit = f"{quantity}{unit}"
                    # Remove duplicate units
                    quantity_unit = quantity_unit.replace('gg', 'g').replace('mlml', 'ml').replace('pcspcs', 'pcs').replace('pcpcs', 'pcs')
                    
                    missing_text = f"{name}: {quantity_unit}"
                    missing_items.append(missing_text)
                    print(f"    Missing: {missing_text}")
                
                converted_recipe = Recipe(
                    name=recipe_data.get('recipe_name', f'Recipe {i+1}'),
                    ingredients=ingredients,
                    missing_items=missing_items,
                    steps=recipe_data.get('steps', []),
                    servings=request.servings,
                    cooking_time=f"{20 + i*5} mins"  # Estimated time
                )
                converted_recipes.append(converted_recipe)
            
            return RecipeResponse(recipes=converted_recipes)
            
        except Exception as e:
            print(f" [PYTHON] Error with Groq AI: {e}")
            return self._create_fallback_recipes(request.servings, request.items)
    
    def _standardize_unit(self, unit, quantity):
        """Convert units to standard format and adjust quantities"""
        unit_lower = unit.lower().strip()
        
        # Weight conversions
        if unit_lower in ['kg', 'kilogram', 'kilograms']:
            return {'quantity': quantity * 1000, 'unit': 'g'}
        elif unit_lower in ['g', 'gram', 'grams', 'gm']:
            return {'quantity': quantity, 'unit': 'g'}
        
        # Volume conversions
        elif unit_lower in ['l', 'liter', 'liters', 'litre', 'litres']:
            return {'quantity': quantity * 1000, 'unit': 'ml'}
        elif unit_lower in ['ml', 'milliliter', 'milliliters']:
            return {'quantity': quantity, 'unit': 'ml'}
        
        # Count conversions
        elif unit_lower in ['dozen', 'doz']:
            return {'quantity': quantity * 12, 'unit': 'pcs'}
        elif unit_lower in ['pcs', 'piece', 'pieces', 'pc', 'count', 'nos']:
            return {'quantity': quantity, 'unit': 'pcs'}
        
        # Default to pieces
        else:
            return {'quantity': quantity, 'unit': 'pcs'}
    
    def _create_fallback_recipes(self, servings: int, available_items) -> RecipeResponse:
        print(f" [PYTHON] Creating fallback recipes for {servings} servings")
        
        fallback_recipes = []
        for i in range(4):
            recipe_name = f"Simple Recipe {i+1}"
            
            # Use available items
            ingredients = []
            for item in available_items:
                unit_data = self._standardize_unit(item.unit, item.quantity)
                needed_qty = min(unit_data['quantity'] // servings, unit_data['quantity'])
                if needed_qty > 0:
                    ingredients.append(f"{item.name}: {needed_qty} {unit_data['unit']}")
            
            fallback_recipe = Recipe(
                name=recipe_name,
                ingredients=ingredients,
                missing_items=["Salt: 5 g", "Oil: 30 ml"] if i % 2 == 0 else ["Pepper: 3 g"],
                steps=[
                    "Prepare all available ingredients",
                    "Heat cooking surface if needed",
                    "Combine ingredients according to recipe type",
                    "Cook for appropriate time",
                    "Season and serve hot"
                ],
                servings=servings,
                cooking_time=f"{15 + i*5} mins"
            )
            fallback_recipes.append(fallback_recipe)
        
        return RecipeResponse(recipes=fallback_recipes)