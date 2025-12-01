package com.innogent.pantry_mind.service;

import com.innogent.pantry_mind.dto.request.CategoryRequestDTO;
import com.innogent.pantry_mind.dto.response.CategoryResponseDTO;

import java.util.List;

public interface CategoryService {
    CategoryResponseDTO create(CategoryRequestDTO categoryRequestDTO);
    CategoryResponseDTO findById(Long id);
    List<CategoryResponseDTO> findAll();
}
