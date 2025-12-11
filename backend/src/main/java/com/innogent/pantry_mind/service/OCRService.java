package com.innogent.pantry_mind.service;

import com.innogent.pantry_mind.entity.AiExtractedItems;
import com.innogent.pantry_mind.entity.OcrUpload;
import com.innogent.pantry_mind.dto.response.OCRResponseDto;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface OCRService {
    OCRProcessingResult processBill(MultipartFile file, Long kitchenId, Long userId);
    OCRProcessingResult processLabel(MultipartFile file, Long kitchenId, Long userId);
    OCRProcessingResult processProduct(MultipartFile file, Long kitchenId, Long userId, String mode);
    
    @lombok.Data
    @lombok.Builder
    class OCRProcessingResult {
        private OcrUpload ocrUpload;
        private List<AiExtractedItems> extractedItems;
        private OCRResponseDto ocrResponse;
    }
}