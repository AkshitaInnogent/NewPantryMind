package com.innogent.pantry_mind.controller;

import com.innogent.pantry_mind.entity.ConsumptionEvent;
import com.innogent.pantry_mind.repository.ConsumptionEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/consumption")
@RequiredArgsConstructor
@CrossOrigin
public class ConsumptionController {
    
    private final ConsumptionEventRepository consumptionRepository;
    
    @GetMapping
    public ResponseEntity<List<ConsumptionEvent>> getConsumptionHistory(
            @RequestParam Long kitchenId,
            @RequestParam(defaultValue = "30") int days) {
        
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        List<ConsumptionEvent> events = consumptionRepository
            .findByKitchenIdAndCreatedAtAfter(kitchenId, since);
        return ResponseEntity.ok(events);
    }
}
