package com.innogent.pantry_mind.dto.request;

import lombok.*;
import jakarta.validation.constraints.Size;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequestDTO {
    private String username;
    private String name;
    private String email;
    
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password;
}





