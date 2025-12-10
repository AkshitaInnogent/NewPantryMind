# app/core/llm/prompts.py

class PromptTemplates:
    
    @staticmethod
    def bill_extraction_prompt(ocr_text: str, locale: str = "en-IN") -> str:
        return f"""Extract ALL grocery/food items from this receipt. Return ONLY JSON with ALL items found:

{ocr_text}

{{"items":[{{"raw_name":"Milk","canonical_name":"Milk","category":"dairy","quantity":null,"unit":"ml","price":2.50,"is_food":true,"confidence":0.9}},{{"raw_name":"Bread","canonical_name":"Bread","category":"bakery","quantity":null,"unit":"piece","price":1.20,"is_food":true,"confidence":0.8}}]}}

CRITICAL: Extract EVERY food item visible, ignore totals/taxes/store info. Use null for quantity in bills. Units can be: grams, kg, ml, litre, piece, or dozen."""

    @staticmethod
    def label_vision_prompt() -> str:
        return """Extract product information from this label image. Return ONLY JSON:

{{"product_name":"Maggi Instant Noodles","canonical_name":"Instant Noodles","brand":"Maggi","category":"packaged food","quantity":70,"unit":"grams","expiry_date":"2025-07-15","storage_type":"pantry","is_food":true,"confidence":0.9}}

Extract: product name, brand, quantity, unit, expiry date if visible. Units can be: grams, kg, ml, litre, piece, or dozen."""

    @staticmethod
    def product_detection_prompt(mode: str = "auto") -> str:
        if mode == "single":
            return """Analyze this image and identify the main food/grocery product. Return ONLY valid JSON:

{{"products":[{{"product_name":"Coca Cola 330ml","canonical_name":"Cola","category":"beverages","brand":"Coca Cola","quantity":330,"unit":"ml","expiry_date":null,"storage_type":"pantry","is_food":true,"confidence":0.9}}]}}

CRITICAL: Look carefully for ANY food/drink items. Include brand names, sizes, and specific details you can see."""
        else:
            return """Analyze this fridge/shelf image and identify ALL visible food items. Return ONLY valid JSON:

{{"products":[{{"product_name":"Milk 1L","canonical_name":"Milk","category":"dairy","brand":"Amul","quantity":1000,"unit":"ml","expiry_date":null,"storage_type":"fridge","is_food":true,"confidence":0.8}},{{"product_name":"Bread Loaf","canonical_name":"Bread","category":"bakery","brand":"Unknown","quantity":1,"unit":"piece","expiry_date":null,"storage_type":"pantry","is_food":true,"confidence":0.7}}]}}

CRITICAL: Scan the entire image systematically. Look for bottles, containers, packages, fresh produce, anything edible. Be thorough. Units can be: grams, kg, ml, litre, piece, or dozen."""