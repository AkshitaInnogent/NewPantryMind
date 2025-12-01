# app/core/llm/parser.py
import json
import re
from typing import List, Dict, Any, Optional
from datetime import datetime, date, timedelta
from app.models.common import ExtractedItem, StorageType
from app.utils.exceptions import LLMError
import logging

logger = logging.getLogger(__name__)

class LLMResponseParser:
    
    VALID_UNITS = {'g', 'kg', 'l', 'ml', 'piece'}
    
    def parse_bill_response(self, llm_response: str) -> List[ExtractedItem]:
        """Parse LLM response for bill extraction"""
        try:
            logger.info(f"Parsing bill response: {llm_response[:200]}...")
            json_data = self._extract_json(llm_response)
            logger.info(f"Extracted JSON data: {json_data}")
            
            items = []
            for item_data in json_data.get('items', []):
                # Predict expiry date for bill items
                expiry_date = self._predict_expiry_date(item_data.get('raw_name', ''))
                
                # For bills, set quantity to null
                quantity = None
                
                # Validate and normalize unit
                unit = self._normalize_unit(item_data.get('unit'))
                
                item = ExtractedItem(
                    raw_name=item_data.get('raw_name', ''),
                    canonical_name=item_data.get('canonical_name'),
                    category=item_data.get('category'),
                    quantity=quantity,
                    unit=unit,
                    price=self._safe_float(item_data.get('price')),
                    expiry_date=expiry_date,
                    expiry_source="estimated" if expiry_date else None,
                    is_food=item_data.get('is_food', True),
                    confidence=self._safe_float(item_data.get('confidence', 0.0))
                )
                items.append(item)
            
            logger.info(f"Parsed {len(items)} items from bill")
            return items
            
        except Exception as e:
            logger.error(f"Failed to parse bill response: {str(e)}")
            logger.error(f"Raw response was: {llm_response}")
            raise LLMError("PARSE_ERROR", f"Failed to parse LLM response: {str(e)}")

    def parse_label_response(self, llm_response: str) -> ExtractedItem:
        """Parse LLM response for label extraction"""
        try:
            logger.info(f"Parsing label response: {llm_response[:200]}...")
            json_data = self._extract_json(llm_response)
            logger.info(f"Extracted label JSON: {json_data}")
            
            # Handle case where no product info is detected
            if not json_data or not json_data.get('product_name'):
                logger.warning("No product information detected in label")
                return ExtractedItem(
                    raw_name="Unknown Product",
                    canonical_name="Unknown Product",
                    category="unknown",
                    quantity=None,
                    unit=None,
                    expiry_date=None,
                    expiry_source=None,
                    storage_type=StorageType.UNKNOWN,
                    brand=None,
                    is_food=True,
                    confidence=0.0
                )
            
            expiry_date = None
            expiry_source = None
            
            if json_data.get('expiry_date'):
                expiry_date = self._parse_date(json_data['expiry_date'])
                expiry_source = "explicit"
            else:
                # Predict expiry if not found on label
                expiry_date = self._predict_expiry_date(json_data.get('product_name', ''))
                expiry_source = "estimated" if expiry_date else None
            
            storage_type = StorageType.UNKNOWN
            if json_data.get('storage_type'):
                try:
                    storage_type = StorageType(json_data['storage_type'].lower())
                except ValueError:
                    storage_type = StorageType.UNKNOWN
            
            # Validate and normalize unit
            unit = self._normalize_unit(json_data.get('unit'))
            
            item = ExtractedItem(
                raw_name=json_data.get('product_name', ''),
                canonical_name=json_data.get('canonical_name'),
                category=json_data.get('category'),
                quantity=self._safe_float(json_data.get('quantity')),
                unit=unit,
                expiry_date=expiry_date,
                expiry_source=expiry_source,
                storage_type=storage_type,
                brand=json_data.get('brand'),
                is_food=json_data.get('is_food', True),
                confidence=self._safe_float(json_data.get('confidence', 0.0))
            )
            
            logger.info(f"Parsed label item: {item.raw_name}")
            return item
            
        except Exception as e:
            logger.error(f"Failed to parse label response: {str(e)}")
            logger.error(f"Raw response was: {llm_response}")
            raise LLMError("PARSE_ERROR", f"Failed to parse LLM response: {str(e)}")


    def parse_product_response(self, llm_response: str) -> List[ExtractedItem]:
        """Parse LLM response for product detection"""
        try:
            json_data = self._extract_json(llm_response)
            
            items = []
            for product_data in json_data.get('products', []):
                # Get quantity and unit directly from LLM
                quantity = self._safe_float(product_data.get('quantity'))
                unit = self._normalize_unit(product_data.get('unit'))
                
                product_name = product_data.get('product_name', '')
                
                # Predict expiry date
                expiry_date = self._predict_expiry_date(product_name)
                
                item = ExtractedItem(
                    raw_name=product_name,
                    canonical_name=product_data.get('canonical_name'),
                    category=product_data.get('category'),
                    brand=product_data.get('brand'),
                    quantity=quantity,
                    unit=unit,
                    expiry_date=expiry_date,
                    expiry_source="estimated" if expiry_date else None,
                    is_food=product_data.get('is_food', True),
                    confidence=self._safe_float(product_data.get('confidence', 0.0))
                )
                items.append(item)
            
            return items
            
        except Exception as e:
            logger.error(f"Failed to parse product response: {str(e)}")
            raise LLMError("PARSE_ERROR", f"Failed to parse LLM response: {str(e)}")

    def _normalize_unit(self, unit: str) -> Optional[str]:
        """Normalize unit to allowed values"""
        if not unit:
            return 'piece'
        
        unit = unit.lower().strip()
        
        # Map common variations to valid units
        unit_mapping = {
            'pcs': 'piece',
            'pc': 'piece',
            'pieces': 'piece',
            'count': 'piece',
            'gm': 'g',
            'gram': 'g',
            'grams': 'g',
            'kilogram': 'kg',
            'kilograms': 'kg',
            'liter': 'l',
            'liters': 'l',
            'litre': 'l',
            'litres': 'l',
            'milliliter': 'ml',
            'milliliters': 'ml',
            'millilitre': 'ml',
            'millilitres': 'ml'
        }
        
        # Check if unit is already valid
        if unit in self.VALID_UNITS:
            return unit
        
        # Check mapping
        if unit in unit_mapping:
            return unit_mapping[unit]
        
        # Default fallback
        logger.warning(f"Unknown unit '{unit}', defaulting to 'piece'")
        return 'piece'

    def _predict_expiry_date(self, product_name: str) -> Optional[date]:
        """Predict expiry date based on product type"""
        if not product_name:
            return None
        
        product_name = product_name.lower()
        today = date.today()
        
        # Fresh produce (1-7 days)
        if any(word in product_name for word in ['lettuce', 'spinach', 'herbs', 'berries']):
            return today + timedelta(days=3)
        elif any(word in product_name for word in ['banana', 'avocado', 'tomato']):
            return today + timedelta(days=5)
        elif any(word in product_name for word in ['apple', 'orange', 'carrot', 'potato']):
            return today + timedelta(days=14)
        
        # Dairy products (3-14 days)
        elif any(word in product_name for word in ['milk', 'cream']):
            return today + timedelta(days=7)
        elif any(word in product_name for word in ['yogurt', 'cottage cheese']):
            return today + timedelta(days=14)
        elif 'cheese' in product_name:
            return today + timedelta(days=30)
        
        # Meat & Fish (1-5 days)
        elif any(word in product_name for word in ['fish', 'seafood', 'chicken', 'beef', 'pork']):
            return today + timedelta(days=3)
        elif any(word in product_name for word in ['sausage', 'ham', 'bacon']):
            return today + timedelta(days=7)
        
        # Bread & Bakery (3-7 days)
        elif any(word in product_name for word in ['bread', 'bagel', 'muffin']):
            return today + timedelta(days=5)
        
        # Pantry items (months to years)
        elif any(word in product_name for word in ['cereal', 'pasta', 'rice', 'flour']):
            return today + timedelta(days=365)
        elif any(word in product_name for word in ['canned', 'can', 'jar']):
            return today + timedelta(days=730)  # 2 years
        
        # Beverages
        elif any(word in product_name for word in ['juice', 'soda', 'water']):
            return today + timedelta(days=180)  # 6 months
        
        # Default for unknown items
        else:
            return today + timedelta(days=30)  # 1 month default

    def _extract_json(self, response: str) -> Dict[str, Any]:
        """Extract and fix JSON from LLM response"""
        try:
            logger.debug(f"Raw LLM response: '{response}'")
            
            # Handle empty response
            if not response or not response.strip():
                logger.warning("Empty LLM response, returning empty items")
                return {"items": []}
            
            # Clean response - remove markdown and extra text
            cleaned = response.strip()
            if '```json' in cleaned:
                cleaned = re.search(r'```json\s*([\s\S]*?)\s*```', cleaned)
                if cleaned:
                    cleaned = cleaned.group(1)
                else:
                    cleaned = response
            elif '```' in cleaned:
                cleaned = re.search(r'```\s*([\s\S]*?)\s*```', cleaned)
                if cleaned:
                    cleaned = cleaned.group(1)
                else:
                    cleaned = response
            
            # Try direct JSON parse first
            try:
                parsed = json.loads(cleaned)
                # If it's an array, wrap it
                if isinstance(parsed, list):
                    return {"products": parsed}
                return parsed
            except json.JSONDecodeError as e:
                logger.warning(f"Direct JSON parse failed: {e}")
            
            # Try to find JSON pattern
            json_match = re.search(r'[\[\{][\s\S]*[\]\}]', cleaned)
            if not json_match:
                logger.warning("No JSON pattern found")
                return {"items": []}
            
            json_str = json_match.group().strip()
            
            # Try parsing the extracted JSON
            try:
                parsed = json.loads(json_str)
                if isinstance(parsed, list):
                    return {"products": parsed}
                return parsed
            except json.JSONDecodeError:
                # Try fixing common issues
                fixed_json = self._fix_json_issues(json_str)
                parsed = json.loads(fixed_json)
                if isinstance(parsed, list):
                    return {"products": parsed}
                return parsed
                
        except Exception as e:
            logger.error(f"Failed to extract JSON: {str(e)}")
            logger.error(f"Response was: {response}")
            logger.warning("Returning empty items due to parse failure")
            return {"items": []}
    
    def _fix_json_issues(self, json_str: str) -> str:
        """Fix common JSON issues"""
        # Remove trailing commas
        json_str = re.sub(r',\s*([}\]])', r'\1', json_str)
        
        # Fix null values
        json_str = json_str.replace('null', 'null')
        
        # Ensure proper quotes
        json_str = re.sub(r'(\w+):', r'"\1":', json_str)
        
        return json_str
    
    def _fix_truncated_json(self, json_str: str) -> str:
        """Fix truncated and malformed JSON"""
        # Remove trailing commas
        json_str = re.sub(r',(\s*[}\]])', r'\1', json_str)
        
        # Fix incomplete last item (common with truncation)
        json_str = re.sub(r',\s*"[^"]*":\s*[^,}\]]*$', '', json_str)
        
        # Ensure proper closing brackets
        open_braces = json_str.count('{')
        close_braces = json_str.count('}')
        open_brackets = json_str.count('[')
        close_brackets = json_str.count(']')
        
        # Add missing closing brackets
        json_str += '}' * (open_braces - close_braces)
        json_str += ']' * (open_brackets - close_brackets)
        
        # Fix missing quotes around keys
        json_str = re.sub(r'(\w+):', r'"\1":', json_str)
        
        # Fix single quotes to double quotes
        json_str = json_str.replace("'", '"')
        
        return json_str
    
    def _safe_float(self, value: Any) -> Optional[float]:
        """Safely convert value to float"""
        if value is None:
            return None
        try:
            return float(value)
        except (ValueError, TypeError):
            return None
    
    def _parse_date(self, date_str: str) -> Optional[date]:
        """Parse date string to date object"""
        if not date_str:
            return None
        
        try:
            return datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            try:
                return datetime.strptime(date_str, '%d/%m/%Y').date()
            except ValueError:
                logger.warning(f"Could not parse date: {date_str}")
                return None

# Global parser instance
llm_parser = LLMResponseParser()
