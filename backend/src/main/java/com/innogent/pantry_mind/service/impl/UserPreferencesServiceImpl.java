package com.innogent.pantry_mind.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.innogent.pantry_mind.dto.request.UserPreferencesRequestDTO;
import com.innogent.pantry_mind.dto.response.UserPreferencesResponseDTO;
import com.innogent.pantry_mind.entity.User;
import com.innogent.pantry_mind.entity.UserPreferences;
import com.innogent.pantry_mind.repository.UserPreferencesRepository;
import com.innogent.pantry_mind.repository.UserRepository;
import com.innogent.pantry_mind.service.UserPreferencesService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserPreferencesServiceImpl implements UserPreferencesService {
    
    private final UserPreferencesRepository userPreferencesRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public UserPreferencesResponseDTO getUserPreferences(Long userId) {
        UserPreferences preferences = userPreferencesRepository.findByUserId(userId)
                .orElse(createDefaultPreferences(userId));
        return mapToResponseDTO(preferences);
    }
    
    @Override
    public UserPreferencesResponseDTO saveUserPreferences(Long userId, UserPreferencesRequestDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserPreferences preferences = new UserPreferences();
        preferences.setUser(user);
        updatePreferencesFromRequest(preferences, request);
        
        UserPreferences saved = userPreferencesRepository.save(preferences);
        return mapToResponseDTO(saved);
    }
    
    @Override
    public UserPreferencesResponseDTO updateUserPreferences(Long userId, UserPreferencesRequestDTO request) {
        UserPreferences preferences = userPreferencesRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("User preferences not found"));
        
        updatePreferencesFromRequest(preferences, request);
        UserPreferences updated = userPreferencesRepository.save(preferences);
        return mapToResponseDTO(updated);
    }
    
    private UserPreferences createDefaultPreferences(Long userId) {
        // Check if preferences already exist
        Optional<UserPreferences> existing = userPreferencesRepository.findByUserId(userId);
        if (existing.isPresent()) {
            return existing.get();
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserPreferences preferences = new UserPreferences();
        preferences.setUser(user);
        preferences.setSkillLevel(UserPreferences.SkillLevel.INTERMEDIATE);
        preferences.setMaxCookingTime(45);
        preferences.setSpiceLevel(UserPreferences.SpiceLevel.MEDIUM);
        
        return userPreferencesRepository.save(preferences);
    }
    
    private void updatePreferencesFromRequest(UserPreferences preferences, UserPreferencesRequestDTO request) {
        try {
            if (request.getDietaryRestrictions() != null) {
                preferences.setDietaryRestrictions(objectMapper.writeValueAsString(request.getDietaryRestrictions()));
            }
            if (request.getCuisinePreferences() != null) {
                preferences.setCuisinePreferences(objectMapper.writeValueAsString(request.getCuisinePreferences()));
            }
            if (request.getAvoidIngredients() != null) {
                preferences.setAvoidIngredients(objectMapper.writeValueAsString(request.getAvoidIngredients()));
            }
            if (request.getSkillLevel() != null) {
                preferences.setSkillLevel(UserPreferences.SkillLevel.valueOf(request.getSkillLevel()));
            }
            if (request.getSpiceLevel() != null) {
                preferences.setSpiceLevel(UserPreferences.SpiceLevel.valueOf(request.getSpiceLevel()));
            }
            if (request.getMaxCookingTime() != null) {
                preferences.setMaxCookingTime(request.getMaxCookingTime());
            }
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error processing preferences", e);
        }
    }
    
    private UserPreferencesResponseDTO mapToResponseDTO(UserPreferences preferences) {
        UserPreferencesResponseDTO dto = new UserPreferencesResponseDTO();
        dto.setId(preferences.getId());
        dto.setSkillLevel(preferences.getSkillLevel().name());
        dto.setMaxCookingTime(preferences.getMaxCookingTime());
        dto.setSpiceLevel(preferences.getSpiceLevel().name());
        
        try {
            if (preferences.getDietaryRestrictions() != null) {
                dto.setDietaryRestrictions(Arrays.asList(objectMapper.readValue(preferences.getDietaryRestrictions(), String[].class)));
            }
            if (preferences.getCuisinePreferences() != null) {
                dto.setCuisinePreferences(Arrays.asList(objectMapper.readValue(preferences.getCuisinePreferences(), String[].class)));
            }
            if (preferences.getAvoidIngredients() != null) {
                dto.setAvoidIngredients(Arrays.asList(objectMapper.readValue(preferences.getAvoidIngredients(), String[].class)));
            }
        } catch (JsonProcessingException e) {
            // Return empty lists if parsing fails
            dto.setDietaryRestrictions(List.of());
            dto.setCuisinePreferences(List.of());
            dto.setAvoidIngredients(List.of());
        }
        
        return dto;
    }
}