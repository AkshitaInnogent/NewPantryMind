package com.innogent.pantry_mind.service.impl;

import com.innogent.pantry_mind.entity.User;
import com.innogent.pantry_mind.repository.InventoryItemRepository;
import com.innogent.pantry_mind.repository.InventoryRepository;
import com.innogent.pantry_mind.repository.UserRepository;
import com.innogent.pantry_mind.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private InventoryItemRepository inventoryItemRepository;
    
    @Autowired
    private InventoryRepository inventoryRepository;
    
    @Autowired
    private UserRepository userRepository;

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
        
        // Ensure all inventory records have proper minStock values
        ensureMinStockValues(kitchenId);
        
        List<com.innogent.pantry_mind.entity.Inventory> inventories = inventoryRepository.findByKitchenId(kitchenId);
        long totalProducts = inventories.size();
        
        Double totalValueResult = inventoryItemRepository.calculateTotalValueByKitchen(kitchenId);
        double totalValue = totalValueResult != null ? totalValueResult : 0.0;
        
        // Calculate low stock count
        long lowStockCount = 0;
        for (com.innogent.pantry_mind.entity.Inventory inv : inventories) {
            if (inv.getTotalQuantity() != null && inv.getMinStock() != null && 
                inv.getTotalQuantity() < inv.getMinStock()) {
                lowStockCount++;
            }
        }
        
        long expiryCount = inventoryItemRepository.countExpiringItemsByKitchen(kitchenId);
        
        stats.put("totalProducts", totalProducts);
        stats.put("totalValue", totalValue);
        stats.put("lowStockCount", lowStockCount);
        stats.put("expiryCount", expiryCount);
        
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
}