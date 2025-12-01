package com.innogent.pantry_mind.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.util.Date;

@Data
public class CreateInventoryItemRequestDTO {
    @NotBlank(message = "Name is required")
    private String name;
    
    private String description;
    private Long categoryId;
    private Long unitId;
    private Long kitchenId;
    private Long createdBy;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Long quantity;
    
    private String location;
    private Date expiryDate;
}