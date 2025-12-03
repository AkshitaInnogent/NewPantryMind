package com.innogent.pantry_mind.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;
import java.util.Date;

@Data
public class CreateInventoryItemRequestDTO {
    @NotBlank(message = "Name is required")
    private String name;
    
    private String description;
    
    @NotNull(message = "Category is required")
    private Long categoryId;
    
    @NotNull(message = "Unit is required")
    private Long unitId;
    
    @NotNull(message = "Kitchen is required")
    private Long kitchenId;
    
    @NotNull(message = "Created by is required")
    private Long createdBy;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Long quantity;
    
    private Long locationId;
    private Date expiryDate;
    private BigDecimal price;
}