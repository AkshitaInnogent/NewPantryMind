package com.innogent.pantry_mind.repository;

import com.innogent.pantry_mind.entity.AiExtractedItems;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiExtractedItemsRepository extends JpaRepository<AiExtractedItems, Long> {
    
    List<AiExtractedItems> findByOcrUploadId(Long ocrUploadId);
    
    List<AiExtractedItems> findByOcrUploadIdAndIsConfirmedFalse(Long ocrUploadId);
    
    List<AiExtractedItems> findByIsConfirmedTrue();
}