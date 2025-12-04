package com.innogent.pantry_mind.service.impl;
import com.innogent.pantry_mind.dto.request.ChangePasswordRequestDTO;
import com.innogent.pantry_mind.dto.request.LoginRequestDTO;
import com.innogent.pantry_mind.dto.request.RegisterRequestDTO;
import com.innogent.pantry_mind.dto.request.UpdateUserRequestDTO;
import com.innogent.pantry_mind.exception.InvalidPasswordException;

import java.util.List;
import com.innogent.pantry_mind.dto.response.UserResponseDTO;
import com.innogent.pantry_mind.entity.Role;
import com.innogent.pantry_mind.entity.User;
import com.innogent.pantry_mind.exception.ResourceNotFoundException;
import com.innogent.pantry_mind.mapper.UserMapper;
import com.innogent.pantry_mind.repository.RoleRepository;
import com.innogent.pantry_mind.repository.UserRepository;
import com.innogent.pantry_mind.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final RoleRepository roleRepository;

    @Override
    public UserResponseDTO register(RegisterRequestDTO request){

        userRepository.findByEmail(request.getEmail()).ifPresent(u-> {
            throw new RuntimeException("Email already registered");
        });

        userRepository.findByUsername(request.getUsername()).ifPresent(u->{
            throw new RuntimeException("username already registered");
        });

        User user = userMapper.toUser(request);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        // Set default USER role
        Role userRole = roleRepository.findByName("USER")
                .orElseGet(() -> roleRepository.save(Role.builder().name("USER").build()));
        user.setRole(userRole);
        
        User saved = userRepository.save(user);

        return userMapper.toResponse(saved);
    }

    @Override
    public UserResponseDTO login(LoginRequestDTO req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getPasswordHash() == null || !passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        return userMapper.toResponse(user);
    }

    @Override
    public UserResponseDTO getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return userMapper.toResponse(user);
    }

    @Override
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toResponse)
                .toList();
    }

    @Override
    public UserResponseDTO updateUser(Long id, UpdateUserRequestDTO request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if (request.getUsername() != null) user.setUsername(request.getUsername());
        if (request.getName() != null) user.setName(request.getName());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        
        User updated = userRepository.save(user);
        return userMapper.toResponse(updated);
    }

    @Override
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        userRepository.delete(user);
    }

    @Override
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        // TODO: Generate reset token and send email
        // For now, just log the action
        System.out.println("Password reset requested for: " + email);
    }

    @Override
    public void resetPassword(String token, String newPassword) {
        
        System.out.println("Password reset with token: " + token);
    }

    @Override
    public UserResponseDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return userMapper.toResponse(user);
    }

    @Override
    public void changePassword(Long userId, ChangePasswordRequestDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new InvalidPasswordException("Current password is incorrect");
        }
        
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public boolean verifyPassword(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return passwordEncoder.matches(password, user.getPasswordHash());
    }
}