package com.innogent.pantry_mind.service.impl;

import com.innogent.pantry_mind.dto.request.UnitRequestDTO;
import com.innogent.pantry_mind.dto.response.UnitResponseDTO;
import com.innogent.pantry_mind.entity.Unit;
import com.innogent.pantry_mind.exception.DuplicateResourceException;
import com.innogent.pantry_mind.exception.ResourceNotFoundException;
import com.innogent.pantry_mind.mapper.UnitMapper;
import com.innogent.pantry_mind.repository.UnitRepository;
import com.innogent.pantry_mind.service.UnitService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UnitServiceImpl implements UnitService {
    private final UnitRepository unitRepository;
    private final UnitMapper unitMapper;
    
    public UnitServiceImpl(UnitRepository unitRepository, UnitMapper unitMapper) {
        this.unitRepository = unitRepository;
        this.unitMapper = unitMapper;
    }

    @Override
    public UnitResponseDTO create(UnitRequestDTO unitRequestDTO) {
        if (unitRepository.findByName(unitRequestDTO.getName()).isPresent()) {
            throw new DuplicateResourceException("Unit with name '" + unitRequestDTO.getName() + "' already exists");
        }
        Unit unit = unitMapper.toEntity(unitRequestDTO);
        Unit savedUnit = unitRepository.save(unit);
        return unitMapper.toResponse(savedUnit);
    }

    @Override
    public UnitResponseDTO findById(Long id) {
        Unit unit = unitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found with id: " + id));
        return unitMapper.toResponse(unit);
    }

    @Override
    public List<UnitResponseDTO> findAll() {
        return unitRepository.findAll()
                .stream()
                .map(unitMapper::toResponse)
                .toList();
    }
}
