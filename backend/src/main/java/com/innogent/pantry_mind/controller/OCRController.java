package com.innogent.pantry_mind.controller;

import com.innogent.pantry_mind.service.OCRService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/ocr")
@RequiredArgsConstructor
@Tag(name = "OCR Processing", description = "OCR and AI processing for bills, labels, and products")
public class OCRController {
    
    private final OCRService ocrService;
    
    @PostMapping(value = "/bill", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Process bill image and extract items using AI")
    public ResponseEntity<?> processBill(
            @Parameter(description = "Bill image file", required = true)
            @RequestPart("image") MultipartFile file,
            
            @Parameter(description = "Kitchen ID", required = true)
            @RequestParam("kitchenId") Long kitchenId,
            
            @Parameter(description = "User ID who uploaded", required = true)
            @RequestParam("userId") Long userId
    ) {
        try {
            OCRService.OCRProcessingResult result = ocrService.processBill(file, kitchenId, userId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error processing bill: " + e.getMessage());
        }
    }
    
    @PostMapping(value = "/label", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Process product label and extract product info using AI")
    public ResponseEntity<?> processLabel(
            @Parameter(description = "Product label image file", required = true)
            @RequestPart("image") MultipartFile file,
            
            @Parameter(description = "Kitchen ID", required = true)
            @RequestParam("kitchenId") Long kitchenId,
            
            @Parameter(description = "User ID who uploaded", required = true)
            @RequestParam("userId") Long userId
    ) {
        try {
            OCRService.OCRProcessingResult result = ocrService.processLabel(file, kitchenId, userId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error processing label: " + e.getMessage());
        }
    }
    
    @PostMapping(value = "/product", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Process product/shelf image and detect products using AI")
    public ResponseEntity<?> processProduct(
            @Parameter(description = "Product or shelf image file", required = true)
            @RequestPart("image") MultipartFile file,
            
            @Parameter(description = "Kitchen ID", required = true)
            @RequestParam("kitchenId") Long kitchenId,
            
            @Parameter(description = "User ID who uploaded", required = true)
            @RequestParam("userId") Long userId,
            
            @Parameter(description = "Processing mode: single, shelf, or auto")
            @RequestParam(value = "mode", defaultValue = "auto") String mode
    ) {
        try {
            OCRService.OCRProcessingResult result = ocrService.processProduct(file, kitchenId, userId, mode);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error processing product: " + e.getMessage());
        }
    }
}
