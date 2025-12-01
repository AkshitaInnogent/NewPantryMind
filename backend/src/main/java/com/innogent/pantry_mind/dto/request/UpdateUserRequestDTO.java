package com.innogent.pantry_mind.dto.request;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateUserRequestDTO {
    private String username;
    private String name;
    private String email;
}