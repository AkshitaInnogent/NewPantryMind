package com.innogent.pantry_mind.service.impl;
import java.util.List;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import com.innogent.pantry_mind.dto.request.CategoryRequestDTO;
import com.innogent.pantry_mind.dto.response.CategoryResponseDTO;
import com.innogent.pantry_mind.entity.Category;
import com.innogent.pantry_mind.exception.DuplicateResourceException;
import com.innogent.pantry_mind.exception.ResourceNotFoundException;
import com.innogent.pantry_mind.mapper.CategoryMapper;
import com.innogent.pantry_mind.repository.CategoryRepository;
import com.innogent.pantry_mind.service.CategoryService;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    public CategoryResponseDTO create(CategoryRequestDTO categoryRequestDTO) {
        if (categoryRepository.findByName(categoryRequestDTO.getName()).isPresent()) {
            throw new DuplicateResourceException("Category not found with name: " + categoryRequestDTO.getName());
        }
        Category category = categoryMapper.toEntity(categoryRequestDTO);
        Category savedCategory = categoryRepository.save(category);
        return categoryMapper.toResponse(savedCategory);
    }

    @Override
    public CategoryResponseDTO getById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return categoryMapper.toResponse(category);
    }

    @Override
    public List<CategoryResponseDTO> getAll() {
        return categoryRepository.findAll()
                .stream()
                .map(categoryMapper::toResponse)
                .toList();
    }
    
    @Override
    public CategoryResponseDTO findById(Long id) {
        return getById(id);
    }
    
    @Override
    public List<CategoryResponseDTO> findAll() {
        return getAll();
    }
}
