package com.innogent.pantry_mind.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "ai_extracted_items")
public class AiExtractedItems {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ocr_upload_id", nullable = false)
    private Long ocrUploadId;

    @Column(name = "raw_name", nullable = false)
    private String rawName;

    @Column(name = "canonical_name")
    private String canonicalName;

    @Column(name = "category_name")
    private String categoryName;

    private String brand;

    private Double quantity;

    @Column(name = "unit_name")
    private String unitName;

    private Double price;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "expiry_source")
    private String expirySource;

    @Column(name = "storage_type")
    private String storageType;

    @Column(name = "is_food")
    private Boolean isFood;

    private Double confidence;

    @Column(name = "is_confirmed")
    @Builder.Default
    private Boolean isConfirmed = false;

    @Column(name = "raw_ai_json", columnDefinition = "TEXT")
    private String rawAiJson;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
