package com.innogent.pantry_mind.service;

import com.innogent.pantry_mind.dto.request.CategoryRequestDTO;
import com.innogent.pantry_mind.dto.response.CategoryResponseDTO;

import java.util.List;

public interface CategoryService {
    CategoryResponseDTO create(CategoryRequestDTO categoryRequestDTO);
    CategoryResponseDTO getById(Long id);
    CategoryResponseDTO findById(Long id);
    List<CategoryResponseDTO> getAll();
    List<CategoryResponseDTO> findAll();
}
