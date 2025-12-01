package com.innogent.pantry_mind.service;

import com.innogent.pantry_mind.dto.request.UnitRequestDTO;
import com.innogent.pantry_mind.dto.response.UnitResponseDTO;

import java.util.List;

public interface UnitService {
    UnitResponseDTO create(UnitRequestDTO unitRequestDTO);
    UnitResponseDTO findById(Long id);
    List<UnitResponseDTO> findAll();
}
