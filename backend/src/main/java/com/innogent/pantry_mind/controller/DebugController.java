package com.innogent.pantry_mind.controller;

import com.innogent.pantry_mind.entity.PurchaseLog;
import com.innogent.pantry_mind.repository.PurchaseLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/debug")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class DebugController {

    private final PurchaseLogRepository purchaseLogRepository;

    @GetMapping("/purchase-logs/{kitchenId}")
    public ResponseEntity<Map<String, Object>> getPurchaseLogs(
            @PathVariable Long kitchenId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        Map<String, Object> response = new HashMap<>();

        try {
            // Get all purchase logs for the kitchen
            List<PurchaseLog> allLogs = purchaseLogRepository.findTop5ByKitchenIdOrderByPurchasedAtDesc(kitchenId);
            response.put("allLogs", allLogs);

            // Get logs by date range if provided
            if (startDate != null && endDate != null) {
                List<PurchaseLog> filteredLogs = allLogs.stream()
                    .filter(log -> {
                        LocalDateTime purchasedAt = log.getPurchasedAt();
                        return purchasedAt != null && 
                               !purchasedAt.isBefore(startDate) && 
                               !purchasedAt.isAfter(endDate);
                    })
                    .collect(Collectors.toList());
                response.put("logsByDateRange", filteredLogs);
            }

            // Calculate total spending
            BigDecimal totalSpending = allLogs.stream()
                .map(PurchaseLog::getPricePaid)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            response.put("totalSpending", totalSpending);
            response.put("totalItems", allLogs.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error fetching purchase logs for kitchenId: " + kitchenId, e);
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Error fetching purchase logs: " + e.getMessage());
            error.put("status", "error");
            error.put("timestamp", LocalDateTime.now());
            return ResponseEntity.internalServerError().body(error);
        }
    }
    

}