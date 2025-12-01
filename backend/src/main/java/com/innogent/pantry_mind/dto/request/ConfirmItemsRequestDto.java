package com.innogent.pantry_mind.dto.request;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

@Data
public class ConfirmItemsRequestDto {
    
    @NotNull
    private Long ocrUploadId;
    
    @NotEmpty
    private List<ConfirmedItemDto> items;
    
    @Data
    public static class ConfirmedItemDto {
        private String rawName;
        private String canonicalName;
        private String categoryName;
        private String brand;
        private Double quantity;
        private String unitName;
        private String expiryDate;
        private String storageType;
        private Boolean isFood = true;
    }
}
