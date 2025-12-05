package com.innogent.pantry_mind.service;

import com.innogent.pantry_mind.repository.InventoryItemRepository;
import com.innogent.pantry_mind.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardService {

    @Autowired
    private InventoryItemRepository inventoryItemRepository;
    
    @Autowired
    private InventoryRepository inventoryRepository;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalProducts = inventoryRepository.count();
        Double totalValueResult = inventoryItemRepository.calculateTotalValue();
        double totalValue = totalValueResult != null ? totalValueResult : 0.0;
        long lowStockCount = inventoryItemRepository.countLowStockItems();
        long expiryCount = inventoryItemRepository.countExpiringItems();
        
        stats.put("totalProducts", totalProducts);
        stats.put("totalValue", totalValue);
        stats.put("lowStockCount", lowStockCount);
        stats.put("expiryCount", expiryCount);
        
        return stats;
    }
}