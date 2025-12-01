# app/core/llm/prompts.py
from typing import Dict, Any

class PromptTemplates:
    
    @staticmethod
    def bill_extraction_prompt(ocr_text: str, locale: str = "en-IN") -> str:
        return f"""Extract grocery items from receipt text. Return ONLY JSON:

{ocr_text}

{{"items":[{{"raw_name":"Milk","canonical_name":"Milk","category":"dairy","quantity":1.0,"unit":"l","price":2.50,"is_food":true,"confidence":0.9}}]}}

Rules: Extract actual items, skip totals/taxes, use real prices, food items only"""

    staticmethod
    def label_extraction_prompt(ocr_text: str) -> str:
        return f"""Extract product information from this food/product label text. Return ONLY JSON:

{ocr_text}

{{"product_name":"[extract from label]","canonical_name":"[simplified name]","brand":"[brand if visible]","category":"[predict category]","quantity":"[extract number]","unit":"[gm/kg/ml/l/piece]","expiry_date":"[YYYY-MM-DD if visible]","storage_type":"[pantry/fridge/freezer]","is_food":true,"confidence":"[0-1]"}}

CRITICAL: Extract visible information and predict missing details:
- Extract product name, brand, quantity from label text
- Predict appropriate unit based on product type
- Predict storage type based on product category
- Extract expiry date if visible, otherwise leave null
- Predict realistic confidence based on text clarity"""

    @staticmethod
    def product_detection_prompt(mode: str = "auto") -> str:
        single_prompt = """
Identify the food/grocery product in this image. Return ONLY JSON:

{
  "products": [
    {
      "product_name": "Maggi Instant Noodles",
      "canonical_name": "Instant Noodles",
      "category": "packaged food",
      "brand": "Maggi",
      "quantity": 70,
      "unit": "g",
      "expiry_date": "2025-07-15",
      "storage_type": "pantry",
      "is_food": true,
      "confidence": 0.92
    }
  ]
}

CRITICAL RULES:
- Predict realistic quantity using visual estimation.
- unit MUST be one: gm, kg, ml, l, piece.
- Expiry only if printed text visible.
- Liquids: ml or l | Solids: g or kg | Countable items: piece.
- No extra keys or text outside JSON.
- No fictional brands or guesses with low confidence.
"""

        multi_prompt = """
Identify ALL visible food/grocery products in this shelf image. Return ONLY JSON:

{
  "products": [
    {
      "product_name": "Coca Cola",
      "canonical_name": "Cola",
      "category": "beverages",
      "brand": "Coca Cola",
      "quantity": 330,
      "unit": "ml",
      "expiry_date": null,
      "storage_type": "pantry",
      "is_food": true,
      "confidence": 0.88
    },
    {
      "product_name": "Kellogg's Corn Flakes",
      "canonical_name": "Corn Flakes",
      "category": "breakfast cereal",
      "brand": "Kellogg's",
      "quantity": 500,
      "unit": "gm",
      "expiry_date": "2025-01-10",
      "storage_type": "pantry",
      "is_food": true,
      "confidence": 0.91
    }
  ]
}

CRITICAL RULES:
- Only identify food or grocery products.
- unit MUST be one: gm, kg, ml, l, piece.
- Use visual estimation for quantity prediction.
- No assumptions for expiry, only if visible.
- Always output array, even if 1 item.
- No extra keys or comments outside JSON.
"""

        return single_prompt if mode == "single" else multi_prompt
