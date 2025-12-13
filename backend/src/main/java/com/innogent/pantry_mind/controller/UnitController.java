package com.innogent.pantry_mind.controller;

import com.innogent.pantry_mind.dto.request.UnitRequestDTO;
import com.innogent.pantry_mind.dto.response.UnitResponseDTO;
import com.innogent.pantry_mind.service.UnitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/units")
@RequiredArgsConstructor
@CrossOrigin
public class UnitController {
    private final UnitService unitService;

    @PostMapping
    public ResponseEntity<UnitResponseDTO> create(@RequestBody UnitRequestDTO unitRequestDTO) {
        UnitResponseDTO response = unitService.create(unitRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UnitResponseDTO> findById(@PathVariable Long id) {
        UnitResponseDTO response = unitService.findById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<UnitResponseDTO>> findAll() {
        List<UnitResponseDTO> response = unitService.findAll();
        return ResponseEntity.ok(response);
    }
}
