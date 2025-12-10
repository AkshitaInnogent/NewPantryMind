package com.innogent.pantry_mind.dto.request;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class AddToInventoryRequest {
    private BigDecimal quantity;
    private Long unitId;
    private Long categoryId;
    private Long locationId;
    private LocalDate expiryDate;
    private BigDecimal price;
    private String description;
}
