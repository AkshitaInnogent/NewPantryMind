package com.innogent.pantry_mind.dto.request;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class UpdateShoppingListItemRequestDTO {
    private BigDecimal quantity;
    private Long unitId;
}
