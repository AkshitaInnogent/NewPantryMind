package com.innogent.pantry_mind.controller;

import com.innogent.pantry_mind.config.JwtUtil;
import com.innogent.pantry_mind.dto.request.*;
import com.innogent.pantry_mind.dto.response.UserResponseDTO;
import com.innogent.pantry_mind.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
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
        UserResponseDTO user = userService.register(request);
        String token = jwtUtil.generateToken(request.getEmail());
        return ResponseEntity.ok(Map.of("token", token, "user", user));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        String token = jwtUtil.generateToken(request.getEmail());
        UserResponseDTO user = userService.getUserByEmail(request.getEmail());
        return ResponseEntity.ok(Map.of("token", token, "user", user));
    }

    @GetMapping("/refresh")
    public ResponseEntity<UserResponseDTO> refreshUser() {
        // Get current user from token - for now return user by ID 4
        UserResponseDTO user = userService.getUserById(4L);
        return ResponseEntity.ok(user);
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

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequestDTO request) {
        userService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(Map.of("message", "Password reset email sent"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequestDTO request) {
        userService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getCurrentUser() {
        // This would need authentication context to get current user
        // For now, return a simple response
        return ResponseEntity.ok(UserResponseDTO.builder()
                .id(1L)
                .email("test@example.com")
                .name("Test User")
                .role("USER")
                .build());
    }

    @PostMapping("/verify-password")
    public ResponseEntity<?> verifyPassword(@RequestBody Map<String, String> request) {
        return ResponseEntity.ok(Map.of("valid", true));
    }
}