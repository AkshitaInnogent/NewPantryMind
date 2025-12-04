package com.innogent.pantry_mind.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class GenerateShoppingListResponseDTO {
    private Integer itemsGenerated;
    private String message;
    private List<ShoppingListItemResponseDTO> generatedItems;
}
