package com.innogent.pantry_mind.service;

import com.innogent.pantry_mind.dto.request.ConfirmItemsRequestDto;
import com.innogent.pantry_mind.entity.InventoryItem;
import java.util.List;

public interface PantryService {
    List<InventoryItem> confirmAndSaveItems(ConfirmItemsRequestDto request);
}