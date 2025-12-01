package com.innogent.pantry_mind.service.impl;

import com.innogent.pantry_mind.dto.request.CategoryRequestDTO;
import com.innogent.pantry_mind.dto.response.CategoryResponseDTO;
import com.innogent.pantry_mind.entity.Category;
import com.innogent.pantry_mind.exception.DuplicateResourceException;
import com.innogent.pantry_mind.exception.ResourceNotFoundException;
import com.innogent.pantry_mind.mapper.CategoryMapper;
import com.innogent.pantry_mind.repository.CategoryRepository;
import com.innogent.pantry_mind.service.CategoryService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    
    public CategoryServiceImpl(CategoryRepository categoryRepository, CategoryMapper categoryMapper) {
        this.categoryRepository = categoryRepository;
        this.categoryMapper = categoryMapper;
    }

    @Override
    public CategoryResponseDTO create(CategoryRequestDTO categoryRequestDTO) {
        if (categoryRepository.findByName(categoryRequestDTO.getName()).isPresent()) {
            throw new DuplicateResourceException("Category with name '" + categoryRequestDTO.getName() + "' already exists");
        }
        Category category = categoryMapper.toEntity(categoryRequestDTO);
        Category savedCategory = categoryRepository.save(category);
        return categoryMapper.toResponse(savedCategory);
    }

    @Override
    public CategoryResponseDTO findById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        return categoryMapper.toResponse(category);
    }

    @Override
    public List<CategoryResponseDTO> findAll() {
        return categoryRepository.findAll()
                .stream()
                .map(categoryMapper::toResponse)
                .toList();
    }
}
