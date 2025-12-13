package com.innogent.pantry_mind.repository;

import com.innogent.pantry_mind.entity.OcrUpload;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OcrUploadRepository extends JpaRepository<OcrUpload, Long> {
    
    List<OcrUpload> findByKitchenIdOrderByCreatedAtDesc(Long kitchenId);
    
    List<OcrUpload> findByStatus(OcrUpload.ProcessingStatus status);
}