package com.innogent.pantry_mind.service;

import com.innogent.pantry_mind.dto.request.UserPreferencesRequestDTO;
import com.innogent.pantry_mind.dto.response.UserPreferencesResponseDTO;

public interface UserPreferencesService {
    UserPreferencesResponseDTO getUserPreferences(Long userId);
    UserPreferencesResponseDTO saveUserPreferences(Long userId, UserPreferencesRequestDTO request);
    UserPreferencesResponseDTO updateUserPreferences(Long userId, UserPreferencesRequestDTO request);
}