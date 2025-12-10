package com.innogent.pantry_mind.service;

import com.innogent.pantry_mind.dto.request.KitchenRequestDTO;
import com.innogent.pantry_mind.dto.response.KitchenResponseDTO;
import com.innogent.pantry_mind.dto.response.UserResponseDTO;
import java.util.List;

public interface KitchenService {
    KitchenResponseDTO create(KitchenRequestDTO requestDTO);
    KitchenResponseDTO getById(Long id);
    List<KitchenResponseDTO> getAll();
    KitchenResponseDTO update(Long id, KitchenRequestDTO requestDTO);
    void delete(Long id);
    KitchenResponseDTO createWithAdmin(Long userId, KitchenRequestDTO requestDTO);
    KitchenResponseDTO joinByCode(Long userId, String invitationCode);
    List<UserResponseDTO> getKitchenMembers(Long kitchenId);
    void removeMember(Long memberId);
    List<UserResponseDTO> getRecentMembers(Long kitchenId);
}
