package com.innogent.pantry_mind.dto.request;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequestDTO {
    private String username;
    private String name;
    private String email;
    private String password;
}





