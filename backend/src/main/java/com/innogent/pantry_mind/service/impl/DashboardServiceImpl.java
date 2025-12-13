package com.innogent.pantry_mind.service.impl;

import com.innogent.pantry_mind.dto.response.*;
import com.innogent.pantry_mind.entity.User;
import com.innogent.pantry_mind.repository.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import com.innogent.pantry_mind.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;
import java.util.Comparator;
import java.util.Date;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private InventoryItemRepository inventoryItemRepository;
    
    @Autowired
    private InventoryRepository inventoryRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private WasteLogRepository wasteLogRepository;
    
    @Autowired
    private UsageLogRepository usageLogRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private PurchaseLogRepository purchaseLogRepository;
    
    @Autowired
    private ConsumptionEventRepository consumptionEventRepository;
    
    @Autowired
    private com.innogent.pantry_mind.service.AnalyticsService analyticsService;
    
    @Autowired
    private com.innogent.pantry_mind.mapper.InventoryMapper inventoryMapper;

    @Override
    public Map<String, Object> getDashboardStats(String username) {
        Map<String, Object> stats = new HashMap<>();
        
        User user = userRepository.findByEmail(username).orElse(null);
        if (user == null || user.getKitchen() == null) {
            stats.put("totalProducts", 0);
            stats.put("totalValue", 0.0);
            stats.put("lowStockCount", 0);
            stats.put("expiryCount", 0);
            return stats;
        }
        
        Long kitchenId = user.getKitchen().getId();
        System.out.println("\n\n=== DASHBOARD STATS CALLED ===");
        System.out.println("Kitchen ID: " + kitchenId);
        System.out.println("Time: " + new java.util.Date());
        
        // Ensure all inventory records have proper minStock values
        ensureMinStockValues(kitchenId);
        
        // Only count inventories with active items and positive quantities
        List<com.innogent.pantry_mind.entity.Inventory> inventories = inventoryRepository.findByKitchenId(kitchenId);
        long totalProducts = inventories.stream()
            .filter(inv -> inv.getTotalQuantity() != null && inv.getTotalQuantity() > 0)
            .count();
        System.out.println("Total products with quantity > 0: " + totalProducts);
        
        Double totalValueResult = inventoryItemRepository.calculateTotalValueByKitchen(kitchenId);
        double totalValue = totalValueResult != null ? totalValueResult : 0.0;
        System.out.println("Total value: " + totalValue);
        
        // Calculate low stock count
        long lowStockCount = 0;
        for (com.innogent.pantry_mind.entity.Inventory inv : inventories) {
            if (inv.getTotalQuantity() != null && inv.getMinStock() != null && 
                inv.getTotalQuantity() > 0 && inv.getTotalQuantity() < inv.getMinStock()) {
                lowStockCount++;
            }
        }
        System.out.println("Low stock count: " + lowStockCount);
        
        // Use shared method to get expiring items count
        long expiryCount = getExpiringItemsCount(kitchenId);
        System.out.println("Expiry count (shared method): " + expiryCount);
        
        // Get expired products data from waste logs
        Long expiredProductsCount = wasteLogRepository.countExpiredItemsByKitchen(kitchenId);
        BigDecimal expiredWasteValue = wasteLogRepository.calculateExpiredWasteValueByKitchen(kitchenId);
        
        stats.put("totalProducts", totalProducts);
        stats.put("totalValue", totalValue);
        stats.put("lowStockCount", lowStockCount);
        stats.put("expiryCount", expiryCount);
        stats.put("expiredProductsCount", expiredProductsCount != null ? expiredProductsCount : 0L);
        stats.put("expiredWasteValue", expiredWasteValue != null ? expiredWasteValue : BigDecimal.ZERO);
        
        System.out.println("Final stats: " + stats);
        return stats;
    }
    
    private void ensureMinStockValues(Long kitchenId) {
        List<com.innogent.pantry_mind.entity.Inventory> inventories = inventoryRepository.findByKitchenId(kitchenId);
        for (com.innogent.pantry_mind.entity.Inventory inventory : inventories) {
            if (inventory.getMinStock() == null) {
                inventory.setDefaultMinStock();
                inventoryRepository.save(inventory);
            }
        }
    }
    
    @Override
    public FinancialSummaryDTO getFinancialSummary(String username) {
        User user = userRepository.findByEmail(username).orElse(null);
        if (user == null || user.getKitchen() == null) {
            return FinancialSummaryDTO.builder()
                .currentPantryValue(BigDecimal.ZERO)
                .monthlyAdditions(BigDecimal.ZERO)
                .wasteValue(BigDecimal.ZERO)
                .averageItemPrice(BigDecimal.ZERO)
                .wastePercentage(0.0)
                .build();
        }
        
        Long kitchenId = user.getKitchen().getId();
        
        // Current pantry value
        Double totalValueResult = inventoryItemRepository.calculateTotalValueByKitchen(kitchenId);
        BigDecimal currentPantryValue = totalValueResult != null ? BigDecimal.valueOf(totalValueResult) : BigDecimal.ZERO;
        
        // Monthly additions (items added in last 30 days)
        LocalDateTime monthAgo = LocalDateTime.now().minusDays(30);
        List<com.innogent.pantry_mind.entity.InventoryItem> monthlyItems = inventoryItemRepository
            .findByInventoryKitchenIdAndCreatedAtAfter(kitchenId, monthAgo);
        BigDecimal monthlyAdditions = monthlyItems.stream()
            .map(item -> item.getPrice() != null ? item.getPrice() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Waste value (last 30 days)
        BigDecimal wasteValue = wasteLogRepository.calculateWasteValueByKitchenAndPeriod(kitchenId, monthAgo);
        if (wasteValue == null) wasteValue = BigDecimal.ZERO;
        
        // Average item price
        long totalItems = inventoryItemRepository.countByInventoryKitchenId(kitchenId);
        BigDecimal averageItemPrice = totalItems > 0 ? 
            currentPantryValue.divide(BigDecimal.valueOf(totalItems), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        
        // Waste percentage
        Double wastePercentage = monthlyAdditions.compareTo(BigDecimal.ZERO) > 0 ? 
            wasteValue.divide(monthlyAdditions, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue() : 0.0;
        
        return FinancialSummaryDTO.builder()
            .currentPantryValue(currentPantryValue)
            .monthlyAdditions(monthlyAdditions)
            .wasteValue(wasteValue)
            .averageItemPrice(averageItemPrice)
            .wastePercentage(wastePercentage)
            .build();
    }
    
    @Override
    public MostUsedIngredientsDTO getMostUsedIngredients(String username) {
        User user = userRepository.findByEmail(username).orElse(null);
        if (user == null || user.getKitchen() == null) {
            return MostUsedIngredientsDTO.builder().ingredients(List.of()).build();
        }
        
        Long kitchenId = user.getKitchen().getId();
        
        // Get usage logs grouped by inventory item
        List<Object[]> usageData = usageLogRepository.findMostUsedItemsByKitchen(kitchenId);
        
        List<MostUsedIngredientsDTO.IngredientUsage> ingredients = usageData.stream()
            .limit(10) // Top 10 most used
            .map(row -> MostUsedIngredientsDTO.IngredientUsage.builder()
                .itemName((String) row[0])
                .totalConsumed((BigDecimal) row[1])
                .unit((String) row[2])
                .consumptionCount((Long) row[3])
                .build())
            .collect(Collectors.toList());
        
        return MostUsedIngredientsDTO.builder().ingredients(ingredients).build();
    }
    
    @Override
    public CategoryBreakdownDTO getCategoryBreakdown(String username) {
        User user = userRepository.findByEmail(username).orElse(null);
        if (user == null || user.getKitchen() == null) {
            return CategoryBreakdownDTO.builder().categories(List.of()).build();
        }
        
        Long kitchenId = user.getKitchen().getId();
        
        // Get category breakdown data
        List<Object[]> categoryData = inventoryRepository.findCategoryBreakdownByKitchen(kitchenId);
        
        // Calculate total value for percentage calculation
        BigDecimal totalValue = categoryData.stream()
            .map(row -> (BigDecimal) row[2])
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        List<CategoryBreakdownDTO.CategoryData> categories = categoryData.stream()
            .map(row -> {
                BigDecimal categoryValue = (BigDecimal) row[2];
                Double percentage = totalValue.compareTo(BigDecimal.ZERO) > 0 ? 
                    categoryValue.divide(totalValue, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue() : 0.0;
                
                return CategoryBreakdownDTO.CategoryData.builder()
                    .categoryName((String) row[0])
                    .itemCount((Long) row[1])
                    .totalValue(categoryValue)
                    .percentage(percentage)
                    .build();
            })
            .collect(Collectors.toList());
        
        return CategoryBreakdownDTO.builder().categories(categories).build();
    }
    
    @Override
    public MoneyFlowDTO getMoneyFlow(String username) {
        User user = userRepository.findByEmail(username).orElse(null);
        if (user == null || user.getKitchen() == null) {
            return MoneyFlowDTO.builder()
                .totalSpent(BigDecimal.ZERO)
                .totalConsumed(BigDecimal.ZERO)
                .totalWasted(BigDecimal.ZERO)
                .savedFromAlerts(BigDecimal.ZERO)
                .wastePercentage(0.0)
                .savingsPercentage(0.0)
                .build();
        }
        
        Long kitchenId = user.getKitchen().getId();
        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        
        // Total spent this month (actual purchases from PurchaseLog)
        BigDecimal totalSpent = purchaseLogRepository.calculateTotalSpentByPeriod(kitchenId, monthStart);
        if (totalSpent == null) totalSpent = BigDecimal.ZERO;
        
        // Total consumed value this month
        BigDecimal totalConsumed = usageLogRepository.calculateConsumedValueByPeriod(kitchenId, monthStart);
        if (totalConsumed == null) totalConsumed = BigDecimal.ZERO;
        
        // Total wasted this month
        BigDecimal totalWasted = wasteLogRepository.calculateWasteValueByKitchenAndPeriod(kitchenId, monthStart);
        if (totalWasted == null) totalWasted = BigDecimal.ZERO;
        
        // Items saved from expiry alerts
        List<com.innogent.pantry_mind.entity.UsageLog> savedItems = usageLogRepository.findItemsSavedFromExpiry(kitchenId);
        BigDecimal savedFromAlerts = savedItems.stream()
            .map(log -> {
                try {
                    com.innogent.pantry_mind.entity.InventoryItem item = inventoryItemRepository.findById(log.getInventoryItemId()).orElse(null);
                    return item != null && item.getPrice() != null ? 
                        item.getPrice().multiply(log.getQuantityUsed()) : BigDecimal.ZERO;
                } catch (Exception e) {
                    return BigDecimal.ZERO;
                }
            })
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Calculate percentages
        Double wastePercentage = totalSpent.compareTo(BigDecimal.ZERO) > 0 ? 
            totalWasted.divide(totalSpent, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue() : 0.0;
        
        Double savingsPercentage = totalSpent.compareTo(BigDecimal.ZERO) > 0 ? 
            savedFromAlerts.divide(totalSpent, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue() : 0.0;
        
        return MoneyFlowDTO.builder()
            .totalSpent(totalSpent)
            .totalConsumed(totalConsumed)
            .totalWasted(totalWasted)
            .savedFromAlerts(savedFromAlerts)
            .wastePercentage(wastePercentage)
            .savingsPercentage(savingsPercentage)
            .build();
    }
    
    @Override
    public ExpiryAlertSuccessDTO getExpiryAlertSuccess(String username) {
        User user = userRepository.findByEmail(username).orElse(null);
        if (user == null || user.getKitchen() == null) {
            return ExpiryAlertSuccessDTO.builder()
                .alertItems(List.of())
                .totalAlerts(0L)
                .itemsSaved(0L)
                .itemsWasted(0L)
                .valueSaved(BigDecimal.ZERO)
                .valueWasted(BigDecimal.ZERO)
                .successRate(0.0)
                .build();
        }
        
        Long kitchenId = user.getKitchen().getId();
        
        // Use AnalyticsService for simple and accurate data
        Map<String, Object> analytics = analyticsService.getSummaryAnalytics(kitchenId);
        
        Long totalAlerts = ((Number) analytics.getOrDefault("totalAlerts", 0)).longValue();
        Long itemsSaved = ((Number) analytics.getOrDefault("itemsSaved", 0)).longValue();
        Long itemsWasted = ((Number) analytics.getOrDefault("itemsWasted", 0)).longValue();
        Double successRate = ((Number) analytics.getOrDefault("successRate", 0.0)).doubleValue();
        
        return ExpiryAlertSuccessDTO.builder()
            .alertItems(List.of()) // Empty for now
            .totalAlerts(totalAlerts)
            .itemsSaved(itemsSaved)
            .itemsWasted(itemsWasted)
            .valueSaved(BigDecimal.ZERO)
            .valueWasted(BigDecimal.ZERO)
            .successRate(successRate)
            .build();
    }
    
    @Override
    public WasteStreakDTO getWasteStreak(String username) {
        User user = userRepository.findByEmail(username).orElse(null);
        if (user == null || user.getKitchen() == null) {
            return WasteStreakDTO.builder()
                .currentStreak(0)
                .longestStreak(0)
                .streakStartDate(LocalDate.now())
                .daysToNextMilestone(7)
                .nextMilestone(7)
                .recentWins(List.of())
                .build();
        }
        
        Long kitchenId = user.getKitchen().getId();
        
        // Calculate current streak (days without waste)
        Integer currentStreak = 0;
        java.time.LocalDate checkDate = java.time.LocalDate.now();
        
        // Count consecutive days without waste from today backwards
        while (checkDate.isAfter(java.time.LocalDate.now().minusDays(365))) {
            Long wasteCount = wasteLogRepository.countWasteByDate(kitchenId, checkDate.atStartOfDay());
            if (wasteCount > 0) break;
            currentStreak++;
            checkDate = checkDate.minusDays(1);
        }
        
        // If no waste in recent days, calculate streak from consumption vs waste ratio
        if (currentStreak == 0) {
            long totalConsumption = consumptionEventRepository.countByKitchenId(kitchenId);
            long totalWaste = wasteLogRepository.countByKitchenId(kitchenId);
            // If items are being consumed and waste is minimal, show positive streak
            if (totalConsumption > 0 && totalWaste <= 5) {
                currentStreak = Math.min((int)(totalConsumption / 10), 14); // 1 day per 10 consumption events
            }
        }
        
        // Get recent consumption events as wins
        List<com.innogent.pantry_mind.entity.ConsumptionEvent> recentConsumption = consumptionEventRepository
            .findByKitchenIdAndCreatedAtAfter(kitchenId, LocalDateTime.now().minusDays(7))
            .stream()
            .collect(Collectors.groupingBy(
                ce -> ce.getCanonicalName(),
                Collectors.maxBy(Comparator.comparing(ce -> ce.getCreatedAt()))
            ))
            .values()
            .stream()
            .filter(Optional::isPresent)
            .map(Optional::get)
            .limit(5)
            .collect(Collectors.toList());
        
        List<WasteStreakDTO.RecentWin> recentWins = recentConsumption.stream()
            .map(event -> {
                // Find inventory item by name to get price
                List<com.innogent.pantry_mind.entity.InventoryItem> items = inventoryItemRepository.findByKitchenId(kitchenId);
                BigDecimal value = items.stream()
                    .filter(item -> event.getCanonicalName().equals(item.getInventory().getName()))
                    .findFirst()
                    .map(item -> item.getPrice() != null ? item.getPrice() : BigDecimal.ZERO)
                    .orElse(BigDecimal.ZERO);
                
                return WasteStreakDTO.RecentWin.builder()
                    .date(event.getCreatedAt().toLocalDate())
                    .itemName(event.getCanonicalName())
                    .valueSaved(value)
                    .action("Used before expiry")
                    .build();
            })
            .collect(Collectors.toList());
        
        // Calculate next milestone
        Integer[] milestones = {7, 14, 30, 60, 90, 180, 365};
        Integer nextMilestone = 365;
        for (Integer milestone : milestones) {
            if (currentStreak < milestone) {
                nextMilestone = milestone;
                break;
            }
        }
        
        Integer daysToNextMilestone = nextMilestone - currentStreak;
        
        return WasteStreakDTO.builder()
            .currentStreak(currentStreak)
            .longestStreak(currentStreak) // Simplified - could track historical max
            .streakStartDate(java.time.LocalDate.now().minusDays(currentStreak))
            .daysToNextMilestone(daysToNextMilestone)
            .nextMilestone(nextMilestone)
            .recentWins(recentWins)
            .build();
    }
    
    @Override
    public MonthlyProgressDTO getMonthlyProgress(String username) {
        User user = userRepository.findByEmail(username).orElse(null);
        if (user == null || user.getKitchen() == null) {
            return MonthlyProgressDTO.builder()
                .monthlyData(List.of())
                .totalSaved(BigDecimal.ZERO)
                .overallImprovement(0.0)
                .build();
        }
        
        Long kitchenId = user.getKitchen().getId();
        
        // Get monthly waste statistics
        List<Object[]> monthlyStats = wasteLogRepository.findMonthlyWasteStats(kitchenId);
        
        List<MonthlyProgressDTO.MonthlyData> monthlyData = new ArrayList<>();
        BigDecimal baselineWaste = null;
        
        for (int i = monthlyStats.size() - 1; i >= 0; i--) {
            Object[] stat = monthlyStats.get(i);
            LocalDateTime month = (LocalDateTime) stat[0];
            BigDecimal wasteValue = (BigDecimal) stat[1];
            Long itemCount = (Long) stat[2];
            
            if (baselineWaste == null) baselineWaste = wasteValue;
            
            Double improvement = baselineWaste.compareTo(BigDecimal.ZERO) > 0 ? 
                ((baselineWaste.subtract(wasteValue)).divide(baselineWaste, 4, RoundingMode.HALF_UP))
                .multiply(BigDecimal.valueOf(100)).doubleValue() : 0.0;
            
            monthlyData.add(MonthlyProgressDTO.MonthlyData.builder()
                .month(month.getMonth().toString())
                .wasteValue(wasteValue)
                .improvementPercentage(improvement)
                .itemsWasted(itemCount)
                .build());
        }
        
        // Calculate total saved and overall improvement
        BigDecimal totalSaved = BigDecimal.ZERO;
        Double overallImprovement = 0.0;
        
        if (!monthlyData.isEmpty() && baselineWaste != null) {
            BigDecimal currentWaste = monthlyData.get(monthlyData.size() - 1).getWasteValue();
            totalSaved = baselineWaste.subtract(currentWaste);
            overallImprovement = baselineWaste.compareTo(BigDecimal.ZERO) > 0 ? 
                totalSaved.divide(baselineWaste, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue() : 0.0;
        }
        
        return MonthlyProgressDTO.builder()
            .monthlyData(monthlyData)
            .totalSaved(totalSaved)
            .overallImprovement(overallImprovement)
            .build();
    }
    
    private long getExpiringItemsCount(Long kitchenId) {
        // Get inventory with earliest expiry populated (same as ExpiryAlerts page)
        List<com.innogent.pantry_mind.dto.response.InventoryResponseDTO> inventoryDTOs = 
            inventoryRepository.findByKitchenId(kitchenId).stream()
                .filter(inventory -> {
                    Long activeCount = inventoryItemRepository.countByInventoryIdAndIsActiveTrue(inventory.getId());
                    return activeCount != null && activeCount > 0 && inventory.getTotalQuantity() > 0;
                })
                .map(inventory -> {
                    com.innogent.pantry_mind.dto.response.InventoryResponseDTO dto = inventoryMapper.toResponseDTO(inventory);
                    dto.setEarliestExpiry(inventoryItemRepository.findEarliestExpiryByInventoryId(inventory.getId()));
                    return dto;
                })
                .toList();
        
        // Apply same filtering logic as ExpiryAlerts page
        java.time.LocalDate today = java.time.LocalDate.now();
        System.out.println("=== DASHBOARD EXPIRY DEBUG ===");
        System.out.println("Today: " + today);
        System.out.println("Total inventory items: " + inventoryDTOs.size());
        
        return inventoryDTOs.stream()
            .filter(inv -> {
                if (inv.getEarliestExpiry() == null) {
                    System.out.println("SKIP (no expiry): " + inv.getName());
                    return false;
                }
                
                java.time.LocalDate expiryDate = inv.getEarliestExpiry().toInstant()
                    .atZone(java.time.ZoneId.systemDefault()).toLocalDate();
                
                int alertDays = inv.getMinExpiryDaysAlert() != null ? inv.getMinExpiryDaysAlert() : 3;
                java.time.LocalDate alertDate = today.plusDays(alertDays);
                
                boolean isExpiring = expiryDate.isBefore(alertDate) || expiryDate.isEqual(alertDate);
                System.out.println((isExpiring ? "INCLUDE" : "SKIP") + ": " + inv.getName() + 
                    ", expires: " + expiryDate + ", alertDays: " + alertDays + ", alertDate: " + alertDate);
                
                return isExpiring;
            })
            .count();
    }
}