package com.innogent.pantry_mind.service;

import com.innogent.pantry_mind.dto.response.ShoppingSuggestionDTO;
import java.util.List;

public interface UsagePatternService {
    List<ShoppingSuggestionDTO> getDailyPatternSuggestions(Long kitchenId, List<String> existingItems);
    List<ShoppingSuggestionDTO> getWeeklyPatternSuggestions(Long kitchenId, List<String> existingItems);
    List<ShoppingSuggestionDTO> getMonthlyPatternSuggestions(Long kitchenId, List<String> existingItems);
    void recordConsumption(Long kitchenId, String itemName, Double quantity, Long unitId, Long userId);
}
