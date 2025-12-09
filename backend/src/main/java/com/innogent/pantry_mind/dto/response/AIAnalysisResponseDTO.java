package com.innogent.pantry_mind.dto.response;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class AIAnalysisResponseDTO {
    private String analysisType;
    private Integer totalItems;
    private Integer lowStockCount;
    private Double efficiency;
    private List<String> insights;
    private Map<String, Object> patterns;
    private String timestamp;
}
