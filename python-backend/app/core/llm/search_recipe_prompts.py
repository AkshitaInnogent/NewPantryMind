# app/core/llm/search_recipe_prompts.py
from typing import List

class SearchRecipePrompts:
    
    @staticmethod
    def search_recipe_prompt(recipe_name: str, inventory_text: str, servings: int) -> str:
        return f"""Generate a TRADITIONAL recipe for "{recipe_name}" for {servings} people.

IMPORTANT RULES:
1. ALWAYS generate the authentic, traditional version of "{recipe_name}".
2. DO NOT modify or adapt the recipe based on available inventory.
3. Use the user's inventory ONLY to identify:
   - Which required ingredients are available  
   - Which required ingredients are missing  
4. Include ONLY the ingredients that the TRADITIONAL recipe actually needs.
5. Split ingredients into TWO lists:
   a) inventory_items_used → items the user already has and are required in traditional recipe
   b) missing_items → items required in the traditional recipe but NOT in the inventory
6. For every ingredient, you MUST provide:
   - quantity
   - unit (use ONLY: g, ml, pcs)
7. Give full, proper, traditional cooking method with clear numbered steps.
8. DO NOT invent substitutes. If something is missing, add it to missing_items.
9. NO creative adaptation. NO using "similar alternatives". TRADITIONAL RECIPE ONLY.
10. Return ONLY ONE JSON object. No markdown.

USER INVENTORY:
{inventory_text}

QUANTITY GUIDELINES FOR {servings} PERSON(S):
- Rice/Noodles: {150 * servings}g
- Vegetables: {100 * servings}g each
- Meat/Protein: {150 * servings}g
- Oil: {15 * servings}ml
- Onions: {1 * servings} pcs
- Spices: {5 * servings}g each

OUTPUT JSON FORMAT (STRICT):
{{
  "recipes": [
    {{
      "recipe_name": "{recipe_name}",
      "inventory_items_used": [
        {{"name": "ingredient_name", "quantity": "amount", "unit": "g/ml/pcs"}}
      ],
      "missing_items": [
        {{"name": "ingredient_name", "quantity": "amount", "unit": "g/ml/pcs"}}
      ],
      "steps": [
        "Step 1: ...",
        "Step 2: ...",
        "Step 3: ...",
        "Step 4: ...",
        "Step 5: ..."
      ]
    }}
  ]
}}"""