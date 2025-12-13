package com.innogent.pantry_mind.service;

import com.innogent.pantry_mind.entity.*;
import com.innogent.pantry_mind.repository.*;
import com.innogent.pantry_mind.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {
    
    private final InventoryItemRepository inventoryRepository;
    private final UsageLogRepository usageLogRepository;
    private final MealLogRepository mealLogRepository;
    private final WasteLogRepository wasteLogRepository;
    private final PurchaseLogRepository purchaseLogRepository;
    private final CategoryRepository categoryRepository;
    private final ConsumptionEventRepository consumptionEventRepository;
    private final NotificationRepository notificationRepository;
    
    public Map<String, Object> getUsageAnalytics(Long kitchenId) {
        List<Object[]> usageData = usageLogRepository.findTopUsedItemsByKitchen(kitchenId);
        
        List<Map<String, Object>> usage = usageData.stream()
            .limit(10)
            .map(row -> Map.of(
                "name", row[0],
                "usage", row[1]
            ))
            .collect(Collectors.toList());
            
        return Map.of("usage", usage);
    }
    
    public Map<String, Object> getMealAnalytics(Long kitchenId) {
        List<Object[]> mealData = mealLogRepository.findMealTypeDistribution(kitchenId);
        
        List<Map<String, Object>> meals = mealData.stream()
            .map(row -> Map.of(
                "name", row[0],
                "count", row[1]
            ))
            .collect(Collectors.toList());
            
        return Map.of("meals", meals);
    }
    
    public Map<String, Object> getWasteAnalytics(Long kitchenId) {
        log.info("Fetching waste analytics for kitchenId: {}", kitchenId);
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);
        
        List<Object[]> wasteData = wasteLogRepository.findMonthlyWasteData(kitchenId, sixMonthsAgo);
        List<Object[]> consumptionData = usageLogRepository.findMonthlyConsumptionData(kitchenId, sixMonthsAgo);
        
        log.info("Raw waste data: {}", Arrays.deepToString(wasteData.toArray()));
        log.info("Raw consumption data: {}", Arrays.deepToString(consumptionData.toArray()));
        
        // Create a map of month name to waste count
        Map<String, Integer> wasteByMonth = new HashMap<>();
        for (Object[] row : wasteData) {
            try {
                String monthName = (String) row[0];
                String month = monthName != null && monthName.length() >= 3 ? 
                    monthName.substring(0, 3) : monthName;
                int count = row[1] != null ? ((Number) row[1]).intValue() : 0;
                wasteByMonth.put(month, count);
                log.info("Waste - Month: {}, Count: {}", month, count);
            } catch (Exception e) {
                log.error("Error processing waste data row: " + Arrays.toString(row), e);
            }
        }
        
        // Create a map of month name to consumption count
        Map<String, Integer> consumptionByMonth = new HashMap<>();
        for (Object[] row : consumptionData) {
            try {
                String monthName = (String) row[0];
                String month = monthName != null && monthName.length() >= 3 ? 
                    monthName.substring(0, 3) : monthName;
                int count = row[1] != null ? ((Number) row[1]).intValue() : 0;
                consumptionByMonth.put(month, count);
                log.info("Consumption - Month: {}, Count: {}", month, count);
            } catch (Exception e) {
                log.error("Error processing consumption data row: " + Arrays.toString(row), e);
            }
        }
        
        // Get the last 6 months
        List<String> lastSixMonths = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            String month = LocalDateTime.now().minusMonths(i).format(DateTimeFormatter.ofPattern("MMM"));
            lastSixMonths.add(month);
            log.info("Including month in report: {}", month);
        }
        
        // Prepare the response data
        List<Map<String, Object>> waste = new ArrayList<>();
        for (String month : lastSixMonths) {
            Map<String, Object> map = new HashMap<>();
            map.put("month", month);
            map.put("expired", wasteByMonth.getOrDefault(month, 0));
            map.put("consumed", consumptionByMonth.getOrDefault(month, 0));
            waste.add(map);
            log.info("Final data - Month: {}, Expired: {}, Consumed: {}", 
                month, map.get("expired"), map.get("consumed"));
        }
        
        Map<String, Object> result = Map.of("waste", waste);
        log.info("Final waste analytics result: {}", result);
        return result;
    }

    public Map<String, Object> getPurchaseAnalytics(Long kitchenId) {
        log.info("Fetching purchase analytics for kitchenId: {}", kitchenId);
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6)
                .withDayOfMonth(1)
                .withHour(0)
                .withMinute(0)
                .withSecond(0)
                .withNano(0);

        try {
            // Get monthly purchase data
            List<Object[]> monthlyData = purchaseLogRepository
                    .findMonthlyPurchaseDataWithMonthNames(kitchenId, sixMonthsAgo);

            log.info("Raw monthly purchase data: {}", Arrays.deepToString(monthlyData.toArray()));

            // Initialize last 6 months with zero values
            Map<String, Double> monthlySpending = new LinkedHashMap<>();
            DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM");
            for (int i = 5; i >= 0; i--) {
                String month = LocalDateTime.now().minusMonths(i).format(monthFormatter);
                monthlySpending.put(month, 0.0);
            }

            // Update with actual data
            for (Object[] row : monthlyData) {
                try {
                    String month = ((String) row[0]).trim();
                    if (month.length() > 3) {
                        month = month.substring(0, 3);
                    }
                    double total = ((Number) row[1]).doubleValue();
                    // Find matching month (case-insensitive)
                    final String monthKey = month; // Create a final copy for use in lambda
                    monthlySpending.keySet().stream()
                            .filter(m -> m.equalsIgnoreCase(monthKey))
                            .findFirst()
                            .ifPresent(matchingMonth -> {
                                monthlySpending.put(matchingMonth, total);
                                log.info("Processed purchase data - Month: {}, Total: {}", matchingMonth, total);
                            });
                } catch (Exception e) {
                    log.error("Error processing monthly purchase data row: " +
                            Arrays.toString(row), e);
                }
            }

            // Get spending by source
            List<Object[]> spendingBySource = purchaseLogRepository
                    .findSpendingBySource(kitchenId, sixMonthsAgo);

            log.info("Raw spending by source data: {}",
                    Arrays.deepToString(spendingBySource.toArray()));

            // Process spending by source
            List<Map<String, Object>> sourceBreakdown = new ArrayList<>();
            for (Object[] row : spendingBySource) {
                try {
                    if (row[0] != null) {
                        PurchaseLog.PurchaseSource source = (PurchaseLog.PurchaseSource) row[0];
                        double total = ((Number) row[1]).doubleValue();
                        sourceBreakdown.add(Map.of(
                                "source", source.name(),
                                "total", Math.round(total * 100.0) / 100.0
                        ));
                    }
                } catch (Exception e) {
                    log.error("Error processing spending by source row: " +
                            Arrays.toString(row), e);
                }
            }

            // Prepare monthly trends
            List<Map<String, Object>> monthlyTrends = new ArrayList<>();
            for (Map.Entry<String, Double> entry : monthlySpending.entrySet()) {
                monthlyTrends.add(Map.of(
                        "month", entry.getKey(),
                        "total", Math.round(entry.getValue() * 100.0) / 100.0
                ));
            }

            // Calculate total spending
            double totalSpending = monthlySpending.values().stream()
                    .mapToDouble(Double::doubleValue)
                    .sum();

            // Prepare the response
            Map<String, Object> result = new HashMap<>();
            result.put("totalSpending", Math.round(totalSpending * 100.0) / 100.0);
            result.put("monthlyTrends", monthlyTrends);
            result.put("spendingBySource", sourceBreakdown);

            log.info("Final purchase analytics result: {}", result);
            return result;

        } catch (Exception e) {
            log.error("Error in getPurchaseAnalytics", e);
            // Return empty data structure in case of error
            return Map.of(
                    "totalSpending", 0.0,
                    "monthlyTrends", List.of(),
                    "spendingBySource", List.of(),
                    "error", e.getMessage()
            );
        }
    }
    
    public Map<String, Object> getExpiryAnalytics(Long kitchenId) {
        log.info("Fetching expiry analytics for kitchenId: {}", kitchenId);
        List<InventoryItem> items = inventoryRepository.findByKitchenId(kitchenId);
        LocalDate today = LocalDate.now();
        
        List<Map<String, Object>> expiry = items.stream()
            .filter(item -> item.getExpiryDate() != null)
            .map(item -> {
                try {
                    // Convert java.util.Date to java.time.LocalDate
                    Date expiryDate = item.getExpiryDate();
                    LocalDate expiryLocalDate = expiryDate.toInstant()
                        .atZone(java.time.ZoneId.systemDefault())
                        .toLocalDate();
                    
                    long daysLeft = java.time.temporal.ChronoUnit.DAYS.between(today, expiryLocalDate);
                    
                    String status = daysLeft <= 0 ? "expired" : 
                                 daysLeft <= 3 ? "critical" : 
                                 daysLeft <= 7 ? "warning" : "fresh";
                    
                    // Get the inventory name if available, otherwise use a default name
                    String itemName = "Unnamed Item";
                    if (item.getInventory() != null && item.getInventory().getName() != null) {
                        itemName = item.getInventory().getName();
                    }
                    
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", item.getId());
                    map.put("name", itemName);
                    map.put("expiryDate", expiryDate);
                    map.put("expiryDateFormatted", expiryLocalDate.toString());
                    map.put("daysLeft", daysLeft);
                    map.put("status", status);
                    
                    // Add quantity information if available
                    if (item.getCurrentQuantity() != null) {
                        map.put("quantity", item.getCurrentQuantity());
                        if (item.getInventory() != null && item.getInventory().getUnit() != null) {
                            map.put("unit", item.getInventory().getUnit().getName().toLowerCase());
                        }
                    }
                    
                    return map;
                } catch (Exception e) {
                    log.error("Error processing item with ID: " + item.getId(), e);
                    return null;
                }
            })
            .filter(Objects::nonNull)
            .sorted(Comparator.comparing(m -> (Integer) m.get("daysLeft")))
            .collect(Collectors.toList());
        
        // Add summary statistics
        long expiredCount = expiry.stream().filter(m -> "expired".equals(m.get("status"))).count();
        long criticalCount = expiry.stream().filter(m -> "critical".equals(m.get("status"))).count();
        long warningCount = expiry.stream().filter(m -> "warning".equals(m.get("status"))).count();
        long freshCount = expiry.stream().filter(m -> "fresh".equals(m.get("status"))).count();
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalItems", expiry.size());
        summary.put("expired", expiredCount);
        summary.put("critical", criticalCount);
        summary.put("warning", warningCount);
        summary.put("fresh", freshCount);
        summary.put("lastUpdated", new Date().toString());
        
        Map<String, Object> result = new HashMap<>();
        result.put("items", expiry);
        result.put("summary", summary);
        
        log.info("Expiry analytics completed. Found {} items ({} expired, {} critical, {} warning, {} fresh)", 
                expiry.size(), expiredCount, criticalCount, warningCount, freshCount);
                
        return result;
    }
    
    public Map<String, Object> getCategoryAnalytics(Long kitchenId) {
        List<Object[]> categoryData = inventoryRepository.findCategoryDistribution(kitchenId);
        
        List<Map<String, Object>> categories = categoryData.stream()
            .map(row -> Map.of(
                "name", row[0] != null ? row[0] : "Other",
                "count", row[1]
            ))
            .collect(Collectors.toList());
            
        return Map.of("categories", categories);
    }
    
    public Map<String, Object> getSummaryAnalytics(Long kitchenId) {
        log.info("=== DEBUG: Fetching summary analytics for kitchenId: {} ===", kitchenId);
        
        // Count items wasted due to expiry from waste_log
        long itemsWasted = wasteLogRepository.countByKitchenIdAndWasteReason(
            kitchenId, WasteLog.WasteReason.EXPIRED);
        log.info("DEBUG: Items wasted (EXPIRED) from waste_log: {}", itemsWasted);
        
        // Count items saved (used after alert) from usage_log
        long itemsSaved = usageLogRepository.countByKitchenId(kitchenId);
        log.info("DEBUG: Items saved from usage_log: {}", itemsSaved);
        
        // Debug: Check total waste logs
        long totalWaste = wasteLogRepository.countByKitchenId(kitchenId);
        log.info("DEBUG: Total waste logs: {}", totalWaste);
        
        // Total alerts = saved + wasted
        long totalAlerts = itemsSaved + itemsWasted;
        log.info("DEBUG: Total alerts calculated: {} (saved: {} + wasted: {})", totalAlerts, itemsSaved, itemsWasted);
        
        // Calculate success rate
        double successRate = totalAlerts > 0 ? (double) itemsSaved / totalAlerts * 100 : 0;
        log.info("DEBUG: Success rate calculated: {}%", successRate);
        
        Map<String, Object> result = new HashMap<>();
        result.put("totalAlerts", totalAlerts);
        result.put("itemsSaved", itemsSaved);
        result.put("itemsWasted", itemsWasted);
        result.put("successRate", Math.round(successRate * 100.0) / 100.0);
        
        log.info("=== DEBUG: Final result: {} ===", result);
        
        return result;
    }

}