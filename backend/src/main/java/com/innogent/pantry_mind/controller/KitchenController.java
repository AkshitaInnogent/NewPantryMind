package com.innogent.pantry_mind.controller;

import com.innogent.pantry_mind.dto.request.KitchenRequestDTO;
import com.innogent.pantry_mind.dto.response.KitchenResponseDTO;
import com.innogent.pantry_mind.service.KitchenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import com.innogent.pantry_mind.dto.response.UserResponseDTO;

@RestController
@RequestMapping("/api/kitchens")
@RequiredArgsConstructor
@CrossOrigin
public class KitchenController {
    
    private final KitchenService kitchenService;

    @PostMapping
    public ResponseEntity<KitchenResponseDTO> create(@RequestBody KitchenRequestDTO requestDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(kitchenService.create(requestDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<KitchenResponseDTO> getById(@PathVariable Long id) {
        KitchenResponseDTO kitchen = kitchenService.getById(id);
        return ResponseEntity.ok(kitchen);
    }

    @GetMapping
    public ResponseEntity<List<KitchenResponseDTO>> getAll() {
        return ResponseEntity.ok(kitchenService.getAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<KitchenResponseDTO> update(@PathVariable Long id, @RequestBody KitchenRequestDTO requestDTO) {
        return ResponseEntity.ok(kitchenService.update(id, requestDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        kitchenService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/create-with-admin")
    public ResponseEntity<KitchenResponseDTO> createWithAdmin(
            @RequestParam Long userId,
            @RequestBody KitchenRequestDTO requestDTO) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(kitchenService.createWithAdmin(userId, requestDTO));
    }

    @PostMapping("/join-by-code")
    public ResponseEntity<KitchenResponseDTO> joinByCode(@RequestBody Map<String, Object> request) {
        String invitationCode = (String) request.get("invitationCode");
        Long userId = Long.valueOf(request.get("userId").toString());
        return ResponseEntity.ok(kitchenService.joinByCode(userId, invitationCode));
    }

    @GetMapping("/members")
    public ResponseEntity<List<UserResponseDTO>> getKitchenMembers(@RequestParam(required = false) Long kitchenId) {
        if (kitchenId == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(kitchenService.getKitchenMembers(kitchenId));
    }

    @DeleteMapping("/members/{memberId}")
    public ResponseEntity<Void> removeMember(@PathVariable Long memberId) {
        kitchenService.removeMember(memberId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/leave")
    public ResponseEntity<Void> leaveKitchen(@RequestParam Long userId) {
        kitchenService.removeMember(userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/recent-members")
    public ResponseEntity<List<UserResponseDTO>> getRecentMembers(@RequestParam Long kitchenId) {
        return ResponseEntity.ok(kitchenService.getRecentMembers(kitchenId));
    }
}