package com.innogent.pantry_mind.service.impl;

import com.innogent.pantry_mind.dto.ItemShoppingPattern;
import com.innogent.pantry_mind.dto.response.ShoppingSuggestionDTO;
import com.innogent.pantry_mind.entity.*;
import com.innogent.pantry_mind.repository.*;
import com.innogent.pantry_mind.service.UsagePatternService;
import com.innogent.pantry_mind.util.NameNormalizationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Primary
@RequiredArgsConstructor
public class UsagePatternServiceImpl implements UsagePatternService {

    private final ConsumptionEventRepository consumptionEventRepository;
    private final KitchenRepository kitchenRepository;
    private final UserRepository userRepository;
    private final UnitRepository unitRepository;

    @Override
    public List<ShoppingSuggestionDTO> getDailyPatternSuggestions(Long kitchenId, List<String> existingItems) {
        return getSmartPatternSuggestions(kitchenId, existingItems, "DAILY");
    }

    @Override
    public List<ShoppingSuggestionDTO> getWeeklyPatternSuggestions(Long kitchenId, List<String> existingItems) {
        return getSmartPatternSuggestions(kitchenId, existingItems, "WEEKLY");
    }

    @Override
    public List<ShoppingSuggestionDTO> getMonthlyPatternSuggestions(Long kitchenId, List<String> existingItems) {
        return getSmartPatternSuggestions(kitchenId, existingItems, "MONTHLY");
    }

    private List<ShoppingSuggestionDTO> getSmartPatternSuggestions(Long kitchenId, List<String> existingItems, String listType) {
        LocalDateTime since = LocalDateTime.now().minusDays(90);
        List<ConsumptionEvent> events = consumptionEventRepository.findByKitchenIdAndCreatedAtAfter(kitchenId, since);
        
        if (events.isEmpty()) {
            createTestConsumptionData(kitchenId, 1L);
            events = consumptionEventRepository.findByKitchenIdAndCreatedAtAfter(kitchenId, since);
        }
        
        Map<String, List<ConsumptionEvent>> itemConsumption = events.stream()
            .collect(Collectors.groupingBy(ConsumptionEvent::getCanonicalName));

        List<ShoppingSuggestionDTO> suggestions = new ArrayList<>();
        
        for (Map.Entry<String, List<ConsumptionEvent>> entry : itemConsumption.entrySet()) {
            String canonicalName = entry.getKey();
            if (existingItems.contains(canonicalName)) continue;
            
            List<ConsumptionEvent> itemEvents = entry.getValue();
            ItemShoppingPattern pattern = analyzeShoppingPattern(canonicalName, itemEvents);
            
            if (pattern.getRecommendedListType().equals(listType)) {
                // Convert canonical name to display name
                String displayName = convertToDisplayName(canonicalName);
                
                suggestions.add(ShoppingSuggestionDTO.builder()
                    .itemName(displayName)  // Use display name instead of canonical name
                    .suggestedQuantity(pattern.getSuggestedQuantity())
                    .unitName(pattern.getUnitName())
                    .unitId(pattern.getUnitId())
                    .reason(pattern.getReason())
                    .confidenceScore(pattern.getConfidenceScore())
                    .build());
            }
        }
        
        return suggestions.stream().limit(4).collect(Collectors.toList());
    }

    // Add this helper method
    private String convertToDisplayName(String canonicalName) {
        // Convert canonical names back to proper display names
        Map<String, String> displayNames = Map.of(
            "milk", "Milk",
            "bread", "Bread", 
            "chicken", "Chicken",
            "rice", "Rice",
            "egg", "Eggs",
            "yogurt", "Yogurt",
            "oil", "Cooking Oil",
            "sugar", "Sugar",
            "salt", "Salt"
        );
        
        return displayNames.getOrDefault(canonicalName, 
            // Capitalize first letter if not in map
            canonicalName.substring(0, 1).toUpperCase() + canonicalName.substring(1)
        );
    }

    private void createTestConsumptionData(Long kitchenId, Long userId) {
        Kitchen kitchen = kitchenRepository.findById(kitchenId).orElse(null);
        User user = userRepository.findById(userId).orElse(null);
        if (kitchen == null || user == null) return;
        
        Unit pieceUnit = unitRepository.findById(1L).orElse(null);
        Unit literUnit = unitRepository.findById(2L).orElse(null);
        Unit kgUnit = unitRepository.findById(3L).orElse(null);
        
        for (int i = 1; i <= 8; i++) {
            consumptionEventRepository.save(ConsumptionEvent.builder()
                .canonicalName("milk").quantityConsumed(BigDecimal.valueOf(1.0))
                .unit(literUnit).kitchen(kitchen).reason(ConsumptionEvent.EventReason.CONSUMED)
                .triggeredBy(user).createdAt(LocalDateTime.now().minusDays(i)).build());
        }
        
        for (int i = 1; i <= 6; i++) {
            consumptionEventRepository.save(ConsumptionEvent.builder()
                .canonicalName("bread").quantityConsumed(BigDecimal.valueOf(2.0))
                .unit(pieceUnit).kitchen(kitchen).reason(ConsumptionEvent.EventReason.CONSUMED)
                .triggeredBy(user).createdAt(LocalDateTime.now().minusDays(i)).build());
        }
        
        for (int i = 2; i <= 30; i += 7) {
            consumptionEventRepository.save(ConsumptionEvent.builder()
                .canonicalName("chicken").quantityConsumed(BigDecimal.valueOf(1.2))
                .unit(kgUnit).kitchen(kitchen).reason(ConsumptionEvent.EventReason.CONSUMED)
                .triggeredBy(user).createdAt(LocalDateTime.now().minusDays(i)).build());
        }
        
        for (int i = 5; i <= 90; i += 30) {
            consumptionEventRepository.save(ConsumptionEvent.builder()
                .canonicalName("rice").quantityConsumed(BigDecimal.valueOf(2.0))
                .unit(kgUnit).kitchen(kitchen).reason(ConsumptionEvent.EventReason.CONSUMED)
                .triggeredBy(user).createdAt(LocalDateTime.now().minusDays(i)).build());
        }
    }

    private ItemShoppingPattern analyzeShoppingPattern(String itemName, List<ConsumptionEvent> events) {
        double dailyConsumption = calculateDailyConsumption(events);
        int daysBetweenConsumption = calculateAverageDaysBetween(events);
        
        String recommendedListType = determineOptimalShoppingFrequency(itemName, dailyConsumption, daysBetweenConsumption);
        BigDecimal suggestedQuantity = calculateOptimalPurchaseQuantity(recommendedListType, dailyConsumption);
        
        Unit unit = events.stream().map(ConsumptionEvent::getUnit).filter(Objects::nonNull).findFirst().orElse(null);
        
        return ItemShoppingPattern.builder()
            .recommendedListType(recommendedListType)
            .suggestedQuantity(suggestedQuantity)
            .unitName(unit != null ? unit.getName() : "Piece")
            .unitId(unit != null ? unit.getId() : null)
            .reason(generateReason(recommendedListType, dailyConsumption))
            .confidenceScore(calculateConfidence(events.size()))
            .build();
    }

    private String determineOptimalShoppingFrequency(String itemName, double dailyConsumption, int daysBetween) {
        if (isPerishableDaily(itemName)) return "DAILY";
        if (isBulkItem(itemName)) return "MONTHLY";
        if (daysBetween <= 2) return "DAILY";
        else if (daysBetween <= 7) return "WEEKLY";
        else return "MONTHLY";
    }

    private boolean isPerishableDaily(String itemName) {
        Set<String> perishableItems = Set.of("milk", "bread", "egg", "yogurt", "fresh vegetable", "fruit", "meat", "fish");
        return perishableItems.stream().anyMatch(item -> NameNormalizationUtil.normalizeName(itemName).contains(item));
    }

    private boolean isBulkItem(String itemName) {
        Set<String> bulkItems = Set.of("rice", "oil", "sugar", "salt", "flour", "pasta", "lentil", "bean", "spice");
        return bulkItems.stream().anyMatch(item -> NameNormalizationUtil.normalizeName(itemName).contains(item));
    }

    private BigDecimal calculateOptimalPurchaseQuantity(String listType, double dailyConsumption) {
        switch (listType) {
            case "DAILY": return BigDecimal.valueOf(Math.max(dailyConsumption * 1.5, 1));
            case "WEEKLY": return BigDecimal.valueOf(Math.max(dailyConsumption * 7, 1));
            case "MONTHLY": return BigDecimal.valueOf(Math.max(dailyConsumption * 30, 1));
            default: return BigDecimal.ONE;
        }
    }

    private String generateReason(String listType, double dailyConsumption) {
        switch (listType) {
            case "DAILY": return "Perishable item - buy fresh daily";
            case "WEEKLY": return String.format("Regular consumption - %.1f per day", dailyConsumption);
            case "MONTHLY": return "Bulk purchase recommended - long shelf life";
            default: return "Based on usage pattern";
        }
    }

    private double calculateDailyConsumption(List<ConsumptionEvent> events) {
        if (events.isEmpty()) return 0;
        
        double totalConsumption = events.stream().mapToDouble(e -> e.getQuantityConsumed().doubleValue()).sum();
        LocalDateTime earliest = events.stream().map(ConsumptionEvent::getCreatedAt).min(LocalDateTime::compareTo).orElse(LocalDateTime.now());
        long daysBetween = ChronoUnit.DAYS.between(earliest, LocalDateTime.now());
        return daysBetween > 0 ? totalConsumption / daysBetween : totalConsumption;
    }

    private int calculateAverageDaysBetween(List<ConsumptionEvent> events) {
        if (events.size() < 2) return 30;
        
        events.sort(Comparator.comparing(ConsumptionEvent::getCreatedAt));
        long totalDays = 0;
        for (int i = 1; i < events.size(); i++) {
            totalDays += ChronoUnit.DAYS.between(events.get(i-1).getCreatedAt(), events.get(i).getCreatedAt());
        }
        return (int) (totalDays / (events.size() - 1));
    }

    private BigDecimal calculateConfidence(int eventCount) {
        if (eventCount >= 10) return BigDecimal.valueOf(0.9);
        if (eventCount >= 5) return BigDecimal.valueOf(0.7);
        if (eventCount >= 2) return BigDecimal.valueOf(0.5);
        return BigDecimal.valueOf(0.3);
    }

    @Override
    public void recordConsumption(Long kitchenId, String itemName, Double quantity, Long unitId, Long userId) {
        Kitchen kitchen = kitchenRepository.findById(kitchenId).orElse(null);
        User user = userRepository.findById(userId).orElse(null);
        Unit unit = unitId != null ? unitRepository.findById(unitId).orElse(null) : null;
        
        if (kitchen != null) {
            ConsumptionEvent event = ConsumptionEvent.builder()
                .canonicalName(NameNormalizationUtil.normalizeName(itemName))
                .quantityConsumed(BigDecimal.valueOf(quantity))
                .unit(unit)
                .kitchen(kitchen)
                .reason(ConsumptionEvent.EventReason.CONSUMED)
                .triggeredBy(user)
                .build();
                
            consumptionEventRepository.save(event);
        }
    }
}
