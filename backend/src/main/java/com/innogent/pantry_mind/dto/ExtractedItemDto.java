package com.innogent.pantry_mind.dto;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;

@Data
public class ExtractedItemDto {
    
    @JsonProperty("raw_name")
    private String rawName;
    
    @JsonProperty("canonical_name")
    private String canonicalName;
    
    private String category;
    private String brand;
    private Double quantity;
    private String unit;
    private BigDecimal price;
    
    @JsonProperty("expiry_date")
    private String expiryDate;
    
    @JsonProperty("expiry_source")
    private String expirySource;
    
    @JsonProperty("storage_type")
    private String storageType;
    
    @JsonProperty("is_food")
    private Boolean isFood;
    
    private BigDecimal confidence;
}
