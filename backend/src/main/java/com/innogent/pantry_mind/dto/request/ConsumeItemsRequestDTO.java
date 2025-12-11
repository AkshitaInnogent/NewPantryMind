package com.innogent.pantry_mind.dto.request;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class ConsumeItemsRequestDTO {
    private List<ConsumeItemDTO> items;
    private Long userId; // Add userId for tracking
    
    @Data
    public static class ConsumeItemDTO {
        private Long id;
        private BigDecimal consumedQuantity; // Change to BigDecimal for precision
    }
}
