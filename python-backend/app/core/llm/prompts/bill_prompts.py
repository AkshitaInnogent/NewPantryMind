# app/core/llm/prompts/bill_prompts.py
class BillPrompts:
    
    @staticmethod
    def vision_extraction(locale: str = "en-IN", categories: list = None, units: list = None) -> str:
        # Get category and unit lists for prompt
        category_list = ", ".join([cat.get("name", "") for cat in (categories or [])])
        unit_list = ", ".join([unit.get("name", "") for unit in (units or [])])
        
        return f"""Analyze this receipt image and extract ALL grocery/food items. Return ONLY valid JSON:

{{"items":[{{"raw_name":"APPY JUICE 400 ML","canonical_name":"Juice","category":"beverages","quantity":400,"unit":"ml","price":17.44,"is_food":true,"confidence":0.9}}]}}

CRITICAL RULES:
- Extract EVERY food item, ignore totals/taxes/store info
- Extract quantity from item name (e.g., "400 ML" → quantity:400, unit:"ml")
- Use ONLY these categories: {category_list or "dairy, beverages, staples, fruits, vegetables, spices, household"}
- Use ONLY these units: {unit_list or "ml, litre, grams, kg, piece, dozen"}
- If no quantity visible, use quantity:1, unit:"piece"
- Extract exact price shown
- Locale: {locale}
- Only food items should have is_food:true"""

    @staticmethod
    def ocr_fallback(ocr_text: str, locale: str = "en-IN", categories: list = None, units: list = None) -> str:
        category_list = ", ".join([cat.get("name", "") for cat in (categories or [])])
        unit_list = ", ".join([unit.get("name", "") for unit in (units or [])])
        
        return f"""Extract ALL grocery items from receipt text. Return ONLY JSON:

{ocr_text}

{{"items":[{{"raw_name":"Milk","canonical_name":"Milk","category":"dairy","quantity":1,"unit":"piece","price":2.50,"is_food":true,"confidence":0.9}}]}}

Use ONLY these categories: {category_list or "dairy, beverages, staples"}
Use ONLY these units: {unit_list or "ml, litre, grams, kg, piece"}
Extract EVERY food item, ignore totals/taxes."""
