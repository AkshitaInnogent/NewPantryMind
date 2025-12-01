package com.innogent.pantry_mind.controller;

import com.innogent.pantry_mind.entity.OcrUpload;
import com.innogent.pantry_mind.service.OcrUploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/ocr")
public class OcrUploadController {
    private final OcrUploadService ocrUploadService;

    public OcrUploadController(OcrUploadService ocrUploadService) {
        this.ocrUploadService = ocrUploadService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload OCR image to Cloudinary")
    public ResponseEntity<OcrUpload> uploadOcrImage(
            @Parameter(description = "Image file to upload", required = true)
            @RequestPart("image") MultipartFile file,
            
            @Parameter(description = "Kitchen ID", required = true)
            @RequestParam("kitchenId") Long kitchenId,
            
            @Parameter(description = "User ID who uploaded", required = true)
            @RequestParam("uploadedBy") Long uploadedBy
    ) {
        try {
            OcrUpload saved = ocrUploadService.uploadImage(file, kitchenId, uploadedBy);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
