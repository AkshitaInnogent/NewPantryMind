package com.innogent.pantry_mind.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UnitResponseDTO {
    private Long id;
    private String name;
    private String type;
}
