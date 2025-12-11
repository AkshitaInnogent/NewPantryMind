package com.innogent.pantry_mind.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.innogent.pantry_mind.dto.response.OCRResponseDto;
import com.innogent.pantry_mind.entity.AiExtractedItems;
import com.innogent.pantry_mind.entity.OcrUpload;
import com.innogent.pantry_mind.repository.AiExtractedItemsRepository;
import com.innogent.pantry_mind.repository.OcrUploadRepository;
import com.innogent.pantry_mind.service.OCRService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OCRServiceImpl implements OCRService {
    
    private final RestTemplate restTemplate;
    private final OcrUploadRepository ocrUploadRepository;
    private final AiExtractedItemsRepository aiExtractedItemsRepository;
    private final ObjectMapper objectMapper;
    
    @Value("${ocr.api.base-url:http://localhost:8001}")
    private String baseUrl;
    
    @Override
    @Transactional
    public OCRProcessingResult processBill(MultipartFile file, Long kitchenId, Long userId) {
        return processDocument(file, kitchenId, userId, OcrUpload.DocumentType.BILL, "/ocr/bill");
    }
    
    @Override
    @Transactional
    public OCRProcessingResult processLabel(MultipartFile file, Long kitchenId, Long userId) {
        return processDocument(file, kitchenId, userId, OcrUpload.DocumentType.LABEL, "/ocr/label");
    }
    
    @Override
    @Transactional
    public OCRProcessingResult processProduct(MultipartFile file, Long kitchenId, Long userId, String mode) {
        String endpoint = "/ocr/product" + (mode != null ? "?mode=" + mode : "");
        return processDocument(file, kitchenId, userId, OcrUpload.DocumentType.PRODUCT, endpoint);
    }
    
    private OCRProcessingResult processDocument(MultipartFile file, Long kitchenId, Long userId, 
                                             OcrUpload.DocumentType docType, String endpoint) {
        try {
            // 1. Save OCR upload record
            OcrUpload ocrUpload = OcrUpload.builder()
                .kitchenId(kitchenId)
                .uploadedBy(userId)
                .originalFilename(file.getOriginalFilename())
                .documentType(docType)
                .status(OcrUpload.ProcessingStatus.PROCESSING)
                .build();
            
            ocrUpload = ocrUploadRepository.save(ocrUpload);
            
            // 2. Call Python OCR API
            OCRResponseDto ocrResponse = callPythonOCR(endpoint, file);
            
            // 3. Update OCR upload with results
            ocrUpload.setRawOcrText(ocrResponse.getRawOcrText());
            ocrUpload.setPythonRequestId(ocrResponse.getRequestId());
            ocrUpload.setConfidenceSummary(ocrResponse.getConfidenceSummary());
            ocrUpload.setProcessingTimeMs(ocrResponse.getProcessingTimeMs());
            ocrUpload.setStatus(OcrUpload.ProcessingStatus.COMPLETED);
            ocrUploadRepository.save(ocrUpload);
            
            // 4. Save extracted items
            List<AiExtractedItems> extractedItems = saveExtractedItems(ocrResponse, ocrUpload.getId());
            
            return OCRProcessingResult.builder()
                .ocrUpload(ocrUpload)
                .extractedItems(extractedItems)
                .ocrResponse(ocrResponse)
                .build();
                
        } catch (Exception e) {
            log.error("OCR processing failed: {}", e.getMessage());
            throw new RuntimeException("OCR processing failed", e);
        }
    }
    
    private OCRResponseDto callPythonOCR(String endpoint, MultipartFile file) {
        try {
            String url = baseUrl + endpoint;
            log.info("Calling Python OCR API: {}", url);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("image", new ByteArrayResource(file.getBytes()) {  // Changed from "file" to "image"
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            });
            
            HttpEntity<MultiValueMap<String, Object>> requestEntity = 
                new HttpEntity<>(body, headers);
            
            ResponseEntity<OCRResponseDto> response = restTemplate.exchange(
                url, HttpMethod.POST, requestEntity, OCRResponseDto.class);
            
            return response.getBody();
            
        } catch (Exception e) {
            log.error("Python OCR API call failed: {}", e.getMessage());
            throw new RuntimeException("OCR API call failed", e);
        }
    }
    
    private List<AiExtractedItems> saveExtractedItems(OCRResponseDto ocrResponse, Long ocrUploadId) {
        try {
            List<AiExtractedItems> items = ocrResponse.getItems().stream()
                .map(itemDto -> {
                    try {
                        return AiExtractedItems.builder()
                            .ocrUploadId(ocrUploadId)
                            .rawName(itemDto.getRawName())
                            .canonicalName(itemDto.getCanonicalName())
                            .categoryName(itemDto.getCategory())
                            .brand(itemDto.getBrand())
                            .quantity(itemDto.getQuantity())
                            .unitName(itemDto.getUnit())
                            .price(itemDto.getPrice())
                            .expiryDate(parseDate(itemDto.getExpiryDate()))
                            .expirySource(itemDto.getExpirySource())
                            .storageType(itemDto.getStorageType())
                            .isFood(itemDto.getIsFood())
                            .confidence(itemDto.getConfidence())
                            .rawAiJson(objectMapper.writeValueAsString(itemDto))
                            .build();
                    } catch (Exception e) {
                        log.error("Failed to serialize item to JSON: {}", e.getMessage());
                        throw new RuntimeException("JSON serialization failed", e);
                    }
                })
                .toList();
            
            return aiExtractedItemsRepository.saveAll(items);
            
        } catch (Exception e) {
            log.error("Failed to save extracted items: {}", e.getMessage());
            throw new RuntimeException("Failed to save extracted items", e);
        }
    }
    
    private LocalDate parseDate(String dateString) {
        if (dateString == null || dateString.isEmpty()) {
            return null;
        }
        try {
            return LocalDate.parse(dateString, DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (Exception e) {
            return null;
        }
    }
}