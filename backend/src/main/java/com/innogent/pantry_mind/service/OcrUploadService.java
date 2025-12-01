package com.innogent.pantry_mind.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.innogent.pantry_mind.entity.OcrUpload;
import com.innogent.pantry_mind.repository.OcrUploadRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
public class OcrUploadService {
    private final Cloudinary cloudinary;
    private final OcrUploadRepository ocrUploadRepository;

    public OcrUploadService(Cloudinary cloudinary, OcrUploadRepository ocrUploadRepository) {
        this.cloudinary = cloudinary;
        this.ocrUploadRepository = ocrUploadRepository;
    }

    public OcrUpload uploadImage(MultipartFile file, Long kitchenId, Long uploadedBy) throws Exception {
        Map<String, Object> uploadResult = cloudinary.uploader().upload(
            file.getBytes(),
            ObjectUtils.asMap("folder", "ocr_uploads")
        );
        
        String imageUrl = uploadResult.get("secure_url").toString();
        
        // Use Builder pattern instead of constructor
        OcrUpload ocrUpload = OcrUpload.builder()
            .kitchenId(kitchenId)
            .uploadedBy(uploadedBy)
            .cloudinaryUrl(imageUrl)
            .cloudinaryPublicId(uploadResult.get("public_id").toString())
            .originalFilename(file.getOriginalFilename())
            .status(OcrUpload.ProcessingStatus.PENDING)
            .build();
            
        return ocrUploadRepository.save(ocrUpload);
    }
}
