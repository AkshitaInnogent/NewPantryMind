# app/core/llm/prompts/label_prompts.py
class LabelPrompts:
    
    @staticmethod
    def vision_extraction(categories: list = None, units: list = None) -> str:
        category_list = ", ".join([cat.get("name", "") for cat in (categories or [])])
        unit_list = ", ".join([unit.get("name", "") for unit in (units or [])])
        
        return f"""Extract product information from this label image. Return ONLY valid JSON:

{{"product_name":"Maggi Instant Noodles","canonical_name":"Instant Noodles","brand":"Maggi","category":"staples","quantity":70,"unit":"grams","expiry_date":"2025-07-15","storage_type":"pantry","is_food":true,"confidence":0.9}}

EXTRACT:
- Product name and brand
- Use ONLY these categories: {category_list or "dairy, staples, beverages"}
- Use ONLY these units: {unit_list or "grams, kg, ml, litre, piece"}
- Expiry date if visible (YYYY-MM-DD)
- Storage type: pantry/fridge/freezer"""

# app/core/llm/prompts/product_prompts.py
class ProductPrompts:
    
    @staticmethod
    def single_detection(categories: list = None, units: list = None) -> str:
        category_list = ", ".join([cat.get("name", "") for cat in (categories or [])])
        unit_list = ", ".join([unit.get("name", "") for unit in (units or [])])
        
        return f"""Identify the main food/grocery product in this image. Return ONLY valid JSON:

{{"products":[{{"product_name":"Coca Cola 330ml","canonical_name":"Cola","category":"beverages","brand":"Coca Cola","quantity":330,"unit":"ml","expiry_date":null,"storage_type":"pantry","is_food":true,"confidence":0.9}}]}}

Use ONLY these categories: {category_list or "beverages, dairy, staples"}
Use ONLY these units: {unit_list or "ml, litre, grams, kg, piece"}
Look for ANY food/drink items. Include brand names, sizes, specific details."""
