package com.innogent.pantry_mind.controller;

import com.innogent.pantry_mind.config.JwtUtil;
import com.innogent.pantry_mind.dto.request.*;
import com.innogent.pantry_mind.dto.response.UserResponseDTO;
import com.innogent.pantry_mind.exception.InvalidPasswordException;
import com.innogent.pantry_mind.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@CrossOrigin
public class UserController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequestDTO request) {
        try {
            UserResponseDTO user = userService.register(request);
            return ResponseEntity.ok(Map.of(
                "message", "Registration successful. Please check your email for verification code.",
                "user", user
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            
            String token = jwtUtil.generateToken(request.getEmail());
            UserResponseDTO user = userService.getUserByEmail(request.getEmail());
            return ResponseEntity.ok(Map.of("token", token, "user", user));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }
    }

    @GetMapping("/refresh")
    public ResponseEntity<UserResponseDTO> refreshUser() {
        try {
            String email = getCurrentUserEmail();
            UserResponseDTO user = userService.getUserByEmail(email);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        List<UserResponseDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getById(@PathVariable Long id) {
        UserResponseDTO resp = userService.getUserById(id);
        return ResponseEntity.ok(resp);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(@PathVariable Long id, @RequestBody UpdateUserRequestDTO request) {
        UserResponseDTO resp = userService.updateUser(id, request);
        return ResponseEntity.ok(resp);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
    
    @GetMapping("/check-session")
    public ResponseEntity<?> checkSession() {
        try {
            String email = getCurrentUserEmail();
            userService.getUserByEmail(email); // This will throw if user doesn't exist
            return ResponseEntity.ok(Map.of("valid", true));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("valid", false, "reason", "DATABASE_RESET"));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<UserResponseDTO> getProfile() {
        try {
            String email = getCurrentUserEmail();
            UserResponseDTO user = userService.getUserByEmail(email);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            // User not found (database reset) - return 401 to trigger logout
            return ResponseEntity.status(401).build();
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<UserResponseDTO> updateProfile(@RequestBody UpdateUserRequestDTO request) {
        String email = getCurrentUserEmail();
        UserResponseDTO currentUser = userService.getUserByEmail(email);
        UserResponseDTO user = userService.updateUser(currentUser.getId(), request);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequestDTO request) {
        try {
            String email = getCurrentUserEmail();
            UserResponseDTO currentUser = userService.getUserByEmail(email);
            userService.changePassword(currentUser.getId(), request);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (InvalidPasswordException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/verify-password")
    public ResponseEntity<?> verifyPassword(@RequestBody VerifyPasswordRequestDTO request) {
        String email = getCurrentUserEmail();
        boolean isValid = userService.verifyPassword(email, request.getPassword());
        
        if (isValid) {
            return ResponseEntity.ok(Map.of("valid", true));
        } else {
            return ResponseEntity.badRequest().body(Map.of("valid", false, "error", "Incorrect password"));
        }
    }
    
    @PostMapping("/send-registration-otp")
    public ResponseEntity<?> sendRegistrationOtp(@RequestBody SendOtpRequestDTO request) {
        try {
            userService.sendRegistrationOtp(request.getEmail());
            return ResponseEntity.ok(Map.of("message", "OTP sent to your email"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/verify-registration-otp")
    public ResponseEntity<?> verifyRegistrationOtp(@RequestBody VerifyOtpRequestDTO request) {
        try {
            UserResponseDTO user = userService.verifyRegistrationOtp(request.getEmail(), request.getOtp());
            String token = jwtUtil.generateToken(request.getEmail());
            return ResponseEntity.ok(Map.of(
                "message", "Email verified successfully",
                "token", token,
                "user", user
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/send-password-reset-otp")
    public ResponseEntity<?> sendPasswordResetOtp(@RequestBody SendOtpRequestDTO request) {
        try {
            userService.sendPasswordResetOtp(request.getEmail());
            return ResponseEntity.ok(Map.of("message", "Password reset OTP sent to your email"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/reset-password-with-otp")
    public ResponseEntity<?> resetPasswordWithOtp(@RequestBody ResetPasswordRequestDTO request) {
        try {
            UserResponseDTO user = userService.resetPasswordWithOtp(request);
            String token = jwtUtil.generateToken(request.getEmail());
            return ResponseEntity.ok(Map.of(
                "message", "Password reset successful",
                "token", token,
                "user", user
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getName();
        }
        throw new RuntimeException("User not authenticated");
    }

}
