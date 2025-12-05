package com.innogent.pantry_mind.util;

import java.util.Map;

public class UnitConversionUtil {
    
    private static final Map<String, String> UNIT_MAPPING = Map.of(
        "kg", "grams",
        "litre", "ml", 
        "dozen", "piece"
    );
    
    private static final Map<String, Double> CONVERSION_FACTORS = Map.of(
        "kg", 1000.0,  // 1 kg = 1000 grams
        "litre", 1000.0,   // 1 litre = 1000 ml
        "dozen", 12.0  // 1 dozen = 12 pieces
    );
    
    public static String getBaseUnit(String inputUnit) {
        return UNIT_MAPPING.getOrDefault(inputUnit.toLowerCase(), inputUnit.toLowerCase());
    }
    
    public static Long convertToBaseUnit(Long quantity, String inputUnit) {
        if (quantity == null) return null;
        
        Double factor = CONVERSION_FACTORS.get(inputUnit.toLowerCase());
        if (factor != null) {
            return Math.round(quantity * factor);
        }
        return quantity;
    }
    
    public static boolean needsConversion(String unit) {
        return CONVERSION_FACTORS.containsKey(unit.toLowerCase());
    }
    

}