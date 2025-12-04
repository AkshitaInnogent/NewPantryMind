package com.innogent.pantry_mind.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class GenerateShoppingListRequestDTO {
    @NotNull(message = "Kitchen ID is required")
    private Long kitchenId;
    
    @Positive(message = "Threshold must be positive")
    private Integer threshold = 3;
}
