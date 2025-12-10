package com.innogent.pantry_mind.controller;

import com.innogent.pantry_mind.dto.request.UserPreferencesRequestDTO;
import com.innogent.pantry_mind.dto.response.UserPreferencesResponseDTO;
import com.innogent.pantry_mind.service.UserPreferencesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/preferences")
@RequiredArgsConstructor
public class UserPreferencesController {
    
    private final UserPreferencesService userPreferencesService;
    
    @GetMapping("/{userId}")
    public ResponseEntity<UserPreferencesResponseDTO> getUserPreferences(@PathVariable Long userId) {
        UserPreferencesResponseDTO preferences = userPreferencesService.getUserPreferences(userId);
        return ResponseEntity.ok(preferences);
    }
    
    @PostMapping("/{userId}")
    public ResponseEntity<UserPreferencesResponseDTO> saveUserPreferences(
            @PathVariable Long userId,
            @RequestBody UserPreferencesRequestDTO request) {
        UserPreferencesResponseDTO preferences = userPreferencesService.saveUserPreferences(userId, request);
        return ResponseEntity.ok(preferences);
    }
    
    @PutMapping("/{userId}")
    public ResponseEntity<UserPreferencesResponseDTO> updateUserPreferences(
            @PathVariable Long userId,
            @RequestBody UserPreferencesRequestDTO request) {
        UserPreferencesResponseDTO preferences = userPreferencesService.updateUserPreferences(userId, request);
        return ResponseEntity.ok(preferences);
    }
}