package com.innogent.pantry_mind.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
public class OCRResponseDto {
    @JsonProperty("request_id")
    private String requestId;
    
    @JsonProperty("document_type")
    private String documentType;
    
    @JsonProperty("raw_ocr_text")
    private String rawOcrText;
    
    private List<OCRItemDto> items;
    
    @JsonProperty("confidence_summary")
    private Double confidenceSummary;
    
    @JsonProperty("processing_time_ms")
    private Integer processingTimeMs;
    
    @Data
    public static class OCRItemDto {
        @JsonProperty("raw_name")
        private String rawName;
        
        @JsonProperty("canonical_name")
        private String canonicalName;
        
        private String category;
        private String brand;
        private Double quantity;
        private String unit;
        private Double price;
        
        @JsonProperty("expiry_date")
        private String expiryDate;
        
        @JsonProperty("expiry_source")
        private String expirySource;
        
        @JsonProperty("storage_type")
        private String storageType;
        
        @JsonProperty("is_food")
        private Boolean isFood;
        
        private Double confidence;
    }
}
