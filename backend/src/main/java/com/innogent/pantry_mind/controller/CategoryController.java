package com.innogent.pantry_mind.controller;

import com.innogent.pantry_mind.dto.request.CategoryRequestDTO;
import com.innogent.pantry_mind.dto.response.CategoryResponseDTO;
import com.innogent.pantry_mind.service.CategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping
    public ResponseEntity<CategoryResponseDTO> create(@RequestBody CategoryRequestDTO categoryRequestDTO) {
        CategoryResponseDTO response = categoryService.create(categoryRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponseDTO> findById(@PathVariable Long id) {
        CategoryResponseDTO response = categoryService.findById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponseDTO>> findAll() {
        List<CategoryResponseDTO> response = categoryService.findAll();
        return ResponseEntity.ok(response);
    }
}
