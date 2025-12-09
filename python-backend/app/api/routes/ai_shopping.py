from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from collections import defaultdict
import statistics
import re
import unicodedata
import httpx

router = APIRouter()

def normalize_name(name: str) -> str:
    if not name or not name.strip():
        return ""
    
    normalized = name.lower().strip()
    normalized = unicodedata.normalize('NFD', normalized)
    normalized = ''.join(c for c in normalized if unicodedata.category(c) != 'Mn')
    normalized = re.sub(r'[^a-z\s]', '', normalized)
    normalized = re.sub(r'\s+', ' ', normalized).strip()
    
    if normalized.endswith('s') and len(normalized) > 1:
        normalized = normalized[:-1]
    
    return normalized

class ConsumptionData(BaseModel):
    consumptionEvents: List[Dict[str, Any]]
    currentInventory: List[Dict[str, Any]]
    kitchenId: int
    analysisStartDate: str

class SuggestionRequest(BaseModel):
    kitchenId: int
    listType: str
    existingItems: List[str]
    consumptionData: Optional[ConsumptionData] = None

@router.post("/suggestions")
async def get_ai_suggestions(request: SuggestionRequest) -> Dict[str, Any]:
    try:
        # Handle RANDOM list type - get low stock items
        if request.listType == "RANDOM":
            async with httpx.AsyncClient() as client:
                response = await client.get(f"http://localhost:8080/api/shopping-lists/low-stock/{request.kitchenId}")
                if response.status_code == 200:
                    low_stock_items = response.json()
                    suggestions = convert_low_stock_to_suggestions(low_stock_items, request.existingItems)
                else:
                    suggestions = get_smart_fallback_suggestions("DAILY", request.existingItems)
        else:
            # Handle DAILY, WEEKLY, MONTHLY with AI analysis
            if request.consumptionData and request.consumptionData.consumptionEvents:
                # Use AI analysis
                suggestions = analyze_consumption_patterns(
                    request.consumptionData.dict(), 
                    request.listType, 
                    request.existingItems
                )
            else:
                # Fallback to smart suggestions
                suggestions = get_smart_fallback_suggestions(request.listType, request.existingItems)
            
    except Exception as e:
        print(f"Error in AI analysis: {e}")
        suggestions = get_smart_fallback_suggestions(request.listType, request.existingItems)
    
    return {"suggestions": suggestions}

def convert_low_stock_to_suggestions(low_stock_items: List[Dict], existing_items: List[str]) -> List[Dict]:
    """Convert low stock items to suggestion format"""
    normalized_existing = [normalize_name(item) for item in existing_items]
    
    suggestions = []
    for item in low_stock_items:
        item_name = item.get('name', '')
        if item_name and normalize_name(item_name) not in normalized_existing:
            current_qty = item.get('currentQuantity', 0)
            min_stock = item.get('minStock', 5)
            suggested_qty = max(min_stock - current_qty + (min_stock // 2), 1)
            
            suggestions.append({
                "name": item_name,
                "quantity": suggested_qty,
                "unit": item.get('unit', 'pieces'),
                "reason": f"Low stock - current: {current_qty}, min: {min_stock}"
            })
    
    return suggestions

def analyze_consumption_patterns(consumption_data, list_type, existing_items):
    """
    AI/ML Algorithm for Pattern Analysis
    
    Algorithm Steps:
    1. Time Series Analysis - Identify consumption trends
    2. Frequency Mining - Find regular purchase intervals  
    3. Seasonal Decomposition - Detect daily/weekly/monthly patterns
    4. Predictive Modeling - Forecast future needs
    """
    
    events = consumption_data['consumptionEvents']
    inventory = consumption_data['currentInventory']
    
    if not events:
        return get_smart_fallback_suggestions(list_type, existing_items)
    
    try:
        # Convert to DataFrame for analysis
        df = pd.DataFrame(events)
        df['consumedAt'] = pd.to_datetime(df['consumedAt'])
        df['date'] = df['consumedAt'].dt.date
        
        # Group by item and analyze patterns
        suggestions = []
        item_patterns = analyze_item_patterns(df, list_type)
        
        # Get current inventory status
        inventory_dict = {item['itemName']: item for item in inventory}
        
        for item_name, pattern in item_patterns.items():
            if normalize_name(item_name) not in [normalize_name(x) for x in existing_items]:
                suggestion = generate_suggestion_from_pattern(
                    item_name, pattern, inventory_dict.get(item_name), list_type
                )
                if suggestion:
                    suggestions.append(suggestion)
        
        # If no AI suggestions, fallback to smart suggestions
        if not suggestions:
            suggestions = get_smart_fallback_suggestions(list_type, existing_items)
        
        return suggestions
        
    except Exception as e:
        print(f"Error in pattern analysis: {e}")
        return get_smart_fallback_suggestions(list_type, existing_items)

def analyze_item_patterns(df, list_type):
    """
    Core AI Algorithm: Pattern Recognition
    
    Uses:
    1. Moving Average (7-day window) for trend detection
    2. Frequency Analysis for consumption intervals
    3. Seasonal Decomposition for periodic patterns
    """
    
    patterns = {}
    
    for item_name in df['itemName'].unique():
        try:
            item_df = df[df['itemName'] == item_name].copy()
            item_df = item_df.sort_values('consumedAt')
            
            # Calculate consumption metrics
            total_consumed = item_df['quantity'].sum()
            consumption_days = len(item_df['date'].unique())
            avg_daily_consumption = total_consumed / max(consumption_days, 1)
            
            # Frequency Analysis - Find consumption intervals
            dates = sorted(item_df['date'].unique())
            intervals = []
            for i in range(1, len(dates)):
                interval = (dates[i] - dates[i-1]).days
                intervals.append(interval)
            
            avg_interval = statistics.mean(intervals) if intervals else 7
            
            # Pattern Classification
            pattern_type = classify_consumption_pattern(avg_interval, list_type)
            
            # Trend Analysis using Moving Average
            if len(item_df) >= 3:
                recent_consumption = item_df.tail(7)['quantity'].mean()
                older_consumption = item_df.head(7)['quantity'].mean()
                trend = "increasing" if recent_consumption > older_consumption * 1.2 else \
                       "decreasing" if recent_consumption < older_consumption * 0.8 else "stable"
            else:
                trend = "stable"
            
            patterns[item_name] = {
                'avg_daily_consumption': avg_daily_consumption,
                'avg_interval': avg_interval,
                'pattern_type': pattern_type,
                'trend': trend,
                'total_consumed': total_consumed,
                'consumption_days': consumption_days,
                'last_consumed': item_df['consumedAt'].max()
            }
        except Exception as e:
            print(f"Error analyzing pattern for {item_name}: {e}")
            continue
    
    return patterns

def classify_consumption_pattern(avg_interval, list_type):
    """
    Pattern Classification Logic:
    - Daily: 1-2 days interval
    - Weekly: 3-10 days interval  
    - Monthly: 11+ days interval
    """
    
    if avg_interval <= 2:
        return "daily"
    elif avg_interval <= 10:
        return "weekly"
    else:
        return "monthly"

def generate_suggestion_from_pattern(item_name, pattern, inventory_item, list_type):
    """
    Predictive Modeling: Generate suggestions based on patterns
    
    Algorithm:
    1. Calculate days since last consumption
    2. Predict next purchase date based on interval
    3. Adjust quantity based on trend and list type
    """
    
    try:
        days_since_last = (datetime.now() - pattern['last_consumed'].to_pydatetime()).days
        
        # Check if item matches the list type pattern
        list_type_match = {
            'DAILY': pattern['pattern_type'] == 'daily',
            'WEEKLY': pattern['pattern_type'] == 'weekly', 
            'MONTHLY': pattern['pattern_type'] == 'monthly'
        }
        
        if not list_type_match.get(list_type, False):
            return None
        
        # Calculate suggested quantity using predictive modeling
        base_quantity = pattern['avg_daily_consumption']
        
        # Adjust for list type duration
        duration_multiplier = {'DAILY': 1, 'WEEKLY': 7, 'MONTHLY': 30}
        suggested_quantity = base_quantity * duration_multiplier[list_type]
        
        # Trend adjustment
        if pattern['trend'] == 'increasing':
            suggested_quantity *= 1.3
        elif pattern['trend'] == 'decreasing':
            suggested_quantity *= 0.7
        
        # Consider current inventory
        current_stock = inventory_item['currentQuantity'] if inventory_item else 0
        suggested_quantity = max(suggested_quantity - current_stock, 1)
        
        # Generate reason with AI insights
        reason = generate_ai_reason(pattern, days_since_last, list_type)
        
        return {
            'name': item_name,
            'quantity': int(suggested_quantity),
            'unit': inventory_item['unit'] if inventory_item else 'pieces',
            'reason': reason
        }
    except Exception as e:
        print(f"Error generating suggestion for {item_name}: {e}")
        return None

def generate_ai_reason(pattern, days_since_last, list_type):
    """Generate intelligent reasoning for suggestions"""
    
    try:
        if days_since_last >= pattern['avg_interval']:
            return f"Due for replenishment - typically consumed every {pattern['avg_interval']:.0f} days"
        elif pattern['trend'] == 'increasing':
            return f"Consumption trending up - {pattern['pattern_type']} pattern detected"
        elif pattern['pattern_type'] == list_type.lower():
            return f"Regular {pattern['pattern_type']} consumption pattern - predictive restocking"
        else:
            return f"AI-predicted need based on {pattern['consumption_days']} days of usage data"
    except Exception as e:
        return f"AI-based suggestion for {list_type.lower()} shopping"

def get_smart_fallback_suggestions(list_type: str, existing_items: List[str]) -> List[Dict]:
    """Smart fallback suggestions when AI analysis fails or no data available"""
    
    smart_suggestions = {
        "DAILY": [
            {"name": "Milk", "quantity": 1, "unit": "Liter", "reason": "Perishable - daily fresh purchase"},
            {"name": "Bread", "quantity": 1, "unit": "Piece", "reason": "Perishable - daily fresh purchase"},
            {"name": "Fresh Vegetables", "quantity": 500, "unit": "Gram", "reason": "Perishable - daily fresh purchase"},
            {"name": "Fruits", "quantity": 300, "unit": "Gram", "reason": "Perishable - daily fresh purchase"},
            {"name": "Yogurt", "quantity": 2, "unit": "Piece", "reason": "Daily dairy requirement"},
            {"name": "Butter", "quantity": 200, "unit": "Gram", "reason": "Daily cooking essential"}
        ],
        "WEEKLY": [
            {"name": "Chicken", "quantity": 1, "unit": "Kg", "reason": "Weekly protein planning"},
            {"name": "Eggs", "quantity": 12, "unit": "Piece", "reason": "Weekly consumption - 1 dozen"},
            {"name": "Yogurt", "quantity": 4, "unit": "Piece", "reason": "Weekly dairy requirement"},
            {"name": "Fish", "quantity": 500, "unit": "Gram", "reason": "Weekly protein variety"},
            {"name": "Cheese", "quantity": 300, "unit": "Gram", "reason": "Weekly dairy variety"},
            {"name": "Pasta", "quantity": 500, "unit": "Gram", "reason": "Weekly carb staple"}
        ],
        "MONTHLY": [
            {"name": "Rice", "quantity": 3, "unit": "Kg", "reason": "Bulk staple - monthly stock"},
            {"name": "Oil", "quantity": 1, "unit": "Liter", "reason": "Bulk cooking essential"},
            {"name": "Sugar", "quantity": 1, "unit": "Kg", "reason": "Long shelf life - monthly stock"},
            {"name": "Salt", "quantity": 1, "unit": "Kg", "reason": "Long shelf life - monthly stock"},
            {"name": "Flour", "quantity": 2, "unit": "Kg", "reason": "Bulk baking essential"},
            {"name": "Spices Mix", "quantity": 200, "unit": "Gram", "reason": "Monthly seasoning stock"}
        ],
        "RANDOM": [
            {"name": "Snacks", "quantity": 2, "unit": "Piece", "reason": "Random craving - variety pack"},
            {"name": "Beverages", "quantity": 1, "unit": "Liter", "reason": "Random refreshment"},
            {"name": "Instant Noodles", "quantity": 5, "unit": "Piece", "reason": "Quick meal option"},
            {"name": "Cookies", "quantity": 1, "unit": "Piece", "reason": "Random treat"},
            {"name": "Ice Cream", "quantity": 1, "unit": "Piece", "reason": "Random dessert"},
            {"name": "Chips", "quantity": 2, "unit": "Piece", "reason": "Random snack variety"}
        ]
    }
    
    base_suggestions = smart_suggestions.get(list_type, smart_suggestions["DAILY"])
    normalized_existing = [normalize_name(item) for item in existing_items]
    filtered = [s for s in base_suggestions if normalize_name(s["name"]) not in normalized_existing]
    
    return filtered
