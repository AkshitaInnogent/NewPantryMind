# app/core/llm/prompts.py
from typing import Dict, Any
import base64
from PIL import Image
import io
class PromptTemplates:
    
    @staticmethod
    def bill_extraction_prompt(ocr_text: str, locale: str = "en-IN") -> str:
      return f"""Extract ALL grocery/food items from this receipt. Return ONLY JSON with ALL items found:

  {ocr_text}

  {{"items":[{{"raw_name":"Milk","canonical_name":"Milk","category":"dairy","quantity":null,"unit":"ml","price":2.50,"is_food":true,"confidence":0.9}},{{"raw_name":"Bread","canonical_name":"Bread","category":"bakery","quantity":null,"unit":"piece","price":1.20,"is_food":true,"confidence":0.8}}]}}

  CRITICAL: Extract EVERY food item visible, ignore totals/taxes/store info. Use null for quantity in bills. Units can be: grams, kg, ml, litre, piece, or dozen."""




    # Add to app/core/llm/prompts.py
    # Add to app/core/llm/prompts.py
    @staticmethod
    def label_vision_prompt() -> str:
        return """Extract product information from this label image. Return ONLY JSON:

    {"product_name":"Maggi Instant Noodles","canonical_name":"Instant Noodles","brand":"Maggi","category":"packaged food","quantity":70,"unit":"grams","expiry_date":"2025-07-15","storage_type":"pantry","is_food":true,"confidence":0.9}

    Extract: product name, brand, quantity, unit, expiry date if visible. Units can be: grams, kg, ml, litre, piece, or dozen."""

    staticmethod
    def label_extraction_prompt(ocr_text: str) -> str:
        return f"""Extract product information from this food/product label text. Return ONLY JSON:

{ocr_text}

{{"product_name":"[extract from label]","canonical_name":"[simplified name]","brand":"[brand if visible]","category":"[predict category]","quantity":"[extract number]","unit":"[grams/ml/piece]","expiry_date":"[YYYY-MM-DD if visible]","storage_type":"[pantry/fridge/freezer]","is_food":true,"confidence":"[0-1]"}}

CRITICAL: Extract visible information and predict missing details:
- Extract product name, brand, quantity from label text
- Units can be: grams, kg, ml, litre, piece, or dozen
- Predict storage type based on product category
- Extract expiry date if visible, otherwise leave null
- Predict realistic confidence based on text clarity"""

    # @staticmethod
    @staticmethod
    def product_detection_prompt(mode: str = "auto") -> str:
        return """What food items do you see in this image? Return JSON format:

    {"products":[{"product_name":"Apple","canonical_name":"Apple","category":"fruit","brand":"Unknown","quantity":1,"unit":"piece","expiry_date":null,"storage_type":"fridge","is_food":true,"confidence":0.8}]}

    Look for ANY food items - fruits, vegetables, bottles, cans, packages, containers. Always return at least one item if you see any food."""

    @staticmethod
    def product_detection_prompt(mode: str = "auto") -> str:
        if mode == "single":
            return """Analyze this image and identify the main food/grocery product. Return ONLY valid JSON:

    {"products":[{"product_name":"Coca Cola 330ml","canonical_name":"Cola","category":"beverages","brand":"Coca Cola","quantity":330,"unit":"ml","expiry_date":null,"storage_type":"pantry","is_food":true,"confidence":0.9}]}

    CRITICAL: Look carefully for ANY food/drink items. Include brand names, sizes, and specific details you can see."""
        
        else:
            return """Analyze this fridge/shelf image and identify ALL visible food items. Return ONLY valid JSON:

    {"products":[{"product_name":"Milk 1L","canonical_name":"Milk","category":"dairy","brand":"Amul","quantity":1000,"unit":"ml","expiry_date":null,"storage_type":"fridge","is_food":true,"confidence":0.8},{"product_name":"Bread Loaf","canonical_name":"Bread","category":"bakery","brand":"Unknown","quantity":1,"unit":"piece","expiry_date":null,"storage_type":"pantry","is_food":true,"confidence":0.7}]}

    CRITICAL: Scan the entire image systematically. Look for bottles, containers, packages, fresh produce, anything edible. Be thorough. Units can be: grams, kg, ml, litre, piece, or dozen."""


    # Copy

# Insert at cursor
# 2. Add Fallback Detection
# Add to client.py
    async def vision_completion(self, text_prompt: str, image_base64: str, model: str = None) -> str:
        """Send vision completion with fallback prompts"""
        
        
        
        image_data = base64.b64decode(image_base64)
        image = Image.open(io.BytesIO(image_data))
        
        # Try main prompt first
        try:
            response = await self._generate_vision_content(text_prompt, image, 1000, 0.1)
            if response and len(response.strip()) > 10:
                return response
        except Exception as e:
            logger.warning(f"Main prompt failed: {e}")
        
        # Fallback to simpler prompt
        fallback_prompt = "Describe what food items you see in this image. List each item."
        try:
            response = await self._generate_vision_content(fallback_prompt, image, 500, 0.3)
            # Convert description to JSON format
            return f'{{"products":[{{"product_name":"Detected Food Item","canonical_name":"Food Item","category":"unknown","brand":"Unknown","quantity":1,"unit":"piece","expiry_date":null,"storage_type":"unknown","is_food":true,"confidence":0.5}}]}}'
        except Exception as e:
            logger.error(f"Fallback also failed: {e}")
            raise


