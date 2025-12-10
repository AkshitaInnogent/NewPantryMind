package com.innogent.pantry_mind.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class ConsumeItemsRequestDTO {
    private List<ConsumeItemDTO> items;
    
    @Data
    public static class ConsumeItemDTO {
        private Long id;
        private Double consumedQuantity;
    }
}
