package com.innogent.pantry_mind.dto.request;

import lombok.Data;

@Data
public class UpdateInventoryAlertsRequestDTO {
    private Integer minExpiryDaysAlert;
    private Long minStock;
}