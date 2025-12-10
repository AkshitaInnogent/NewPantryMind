package com.innogent.pantry_mind.service;

import com.innogent.pantry_mind.dto.request.ChangePasswordRequestDTO;
import com.innogent.pantry_mind.dto.request.LoginRequestDTO;
import com.innogent.pantry_mind.dto.request.RegisterRequestDTO;
import com.innogent.pantry_mind.dto.request.ResetPasswordRequestDTO;
import com.innogent.pantry_mind.dto.request.UpdateUserRequestDTO;
import com.innogent.pantry_mind.dto.response.UserResponseDTO;

import java.util.List;

public interface UserService {
    UserResponseDTO register(RegisterRequestDTO request);
    UserResponseDTO login(LoginRequestDTO request);
    UserResponseDTO getUserById(Long userId);
    UserResponseDTO getUserByEmail(String email);
    List<UserResponseDTO> getAllUsers();
    UserResponseDTO updateUser(Long id, UpdateUserRequestDTO request);
    void deleteUser(Long id);
    void forgotPassword(String email);
    void resetPassword(String token, String newPassword);
    void changePassword(Long userId, ChangePasswordRequestDTO request);
    boolean verifyPassword(String email, String password);
    
    // New OTP methods
    void sendRegistrationOtp(String email);
    UserResponseDTO verifyRegistrationOtp(String email, String otp);
    void sendPasswordResetOtp(String email);
    UserResponseDTO resetPasswordWithOtp(ResetPasswordRequestDTO request);
}





