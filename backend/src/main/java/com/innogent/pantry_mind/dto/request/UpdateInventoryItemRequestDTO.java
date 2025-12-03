package com.innogent.pantry_mind.dto.request;

import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;
import java.util.Date;

@Data
public class UpdateInventoryItemRequestDTO {
    private String description;

    @Positive(message = "Quantity must be positive")
    private Long quantity;
    
    private Long locationId;
    private Date expiryDate;
    private BigDecimal price;
}