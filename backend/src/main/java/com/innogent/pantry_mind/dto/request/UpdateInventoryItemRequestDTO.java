package com.innogent.pantry_mind.dto.request;

import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.util.Date;

@Data
public class UpdateInventoryItemRequestDTO {
    private String name;
    private String description;
    private Long categoryId;
    private Long unitId;

    @Positive(message = "Quantity must be positive")
    private Long quantity;
    
    private String location;
    private Date expiryDate;
}