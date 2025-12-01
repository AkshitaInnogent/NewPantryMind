// Create: src/main/java/com/innogent/pantry_mind/service/CloudinaryService.java
package com.innogent.pantry_mind.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {
    
    private final Cloudinary cloudinary;
    
    public CloudinaryUploadResult uploadImage(MultipartFile file, String folder) {
        try {
            Map<String, Object> uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", "image"
                )
            );
            
            return new CloudinaryUploadResult(
                uploadResult.get("url").toString(),
                uploadResult.get("public_id").toString()
            );
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image to Cloudinary", e);
        }
    }
    
    @Data
    public static class CloudinaryUploadResult {
        private final String url;
        private final String publicId;
    }
}
