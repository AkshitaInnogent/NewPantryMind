package com.innogent.pantry_mind.service.impl;

import com.innogent.pantry_mind.dto.request.KitchenRequestDTO;
import com.innogent.pantry_mind.dto.response.KitchenResponseDTO;
import com.innogent.pantry_mind.entity.Kitchen;
import com.innogent.pantry_mind.entity.User;
import com.innogent.pantry_mind.entity.Role;
import com.innogent.pantry_mind.exception.ResourceNotFoundException;
import com.innogent.pantry_mind.mapper.KitchenMapper;
import com.innogent.pantry_mind.repository.KitchenRepository;
import com.innogent.pantry_mind.repository.UserRepository;
import com.innogent.pantry_mind.repository.RoleRepository;
import com.innogent.pantry_mind.service.KitchenService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import com.innogent.pantry_mind.dto.response.UserResponseDTO;
import com.innogent.pantry_mind.mapper.UserMapper;

@Service
@RequiredArgsConstructor
public class KitchenServiceImpl implements KitchenService {
    
    private final KitchenRepository kitchenRepository;
    private final KitchenMapper kitchenMapper;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;

    @Override
    public KitchenResponseDTO create(KitchenRequestDTO requestDTO) {
        Kitchen kitchen = kitchenMapper.toEntity(requestDTO);
        Kitchen saved = kitchenRepository.save(kitchen);
        return kitchenMapper.toResponse(saved);
    }

    @Override
    public KitchenResponseDTO getById(Long id) {
        Kitchen kitchen = kitchenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kitchen not found with id: " + id));
        return kitchenMapper.toResponse(kitchen);
    }

    @Override
    public List<KitchenResponseDTO> getAll() {
        return kitchenRepository.findAll().stream()
                .map(kitchenMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public KitchenResponseDTO update(Long id, KitchenRequestDTO requestDTO) {
        Kitchen kitchen = kitchenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kitchen not found with id: " + id));
        kitchen.setName(requestDTO.getName());
        Kitchen updated = kitchenRepository.save(kitchen);
        return kitchenMapper.toResponse(updated);
    }

    @Override
    public void delete(Long id) {
        if (!kitchenRepository.existsById(id)) {
            throw new ResourceNotFoundException("Kitchen not found with id: " + id);
        }
        kitchenRepository.deleteById(id);
    }

    @Override
    public KitchenResponseDTO createWithAdmin(Long userId, KitchenRequestDTO requestDTO) {
        // Find the user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        // Create kitchen with invitation code
        Kitchen kitchen = kitchenMapper.toEntity(requestDTO);
        kitchen.setInvitationCode(generateInvitationCode());
        Kitchen savedKitchen = kitchenRepository.save(kitchen);
        
        // Update user role to ADMIN and assign kitchen
        Role adminRole = roleRepository.findByName("ADMIN")
                .orElseGet(() -> roleRepository.save(Role.builder().name("ADMIN").build()));
        
        user.setRole(adminRole);
        user.setKitchen(savedKitchen);
        User savedUser = userRepository.save(user);
        System.out.println("👑 ADMIN user saved: " + savedUser.getUsername() + ", Kitchen: " + (savedUser.getKitchen() != null ? savedUser.getKitchen().getId() : "null"));
        
        return kitchenMapper.toResponse(savedKitchen);
    }

    @Override
    public KitchenResponseDTO joinByCode(Long userId, String invitationCode) {
        // Find the user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        // Find kitchen by invitation code
        Kitchen kitchen = kitchenRepository.findByInvitationCode(invitationCode)
                .orElseThrow(() -> new ResourceNotFoundException("Kitchen not found with invitation code: " + invitationCode));
        
        // Update user role to MEMBER and assign kitchen
        Role memberRole = roleRepository.findByName("MEMBER")
                .orElseGet(() -> roleRepository.save(Role.builder().name("MEMBER").build()));
        
        user.setRole(memberRole);
        user.setKitchen(kitchen);
        User savedUser = userRepository.save(user);
        System.out.println("👥 MEMBER user saved: " + savedUser.getUsername() + ", Kitchen: " + (savedUser.getKitchen() != null ? savedUser.getKitchen().getId() : "null"));
        
        return kitchenMapper.toResponse(kitchen);
    }

    @Override
    public List<UserResponseDTO> getKitchenMembers(Long kitchenId) {
        System.out.println("🔍 Looking for members in kitchen ID: " + kitchenId);
        List<User> users = userRepository.findByKitchen_Id(kitchenId);
        System.out.println("📊 Found " + users.size() + " users in kitchen");
        for (User user : users) {
            System.out.println("👤 User: " + user.getUsername() + ", Kitchen: " + (user.getKitchen() != null ? user.getKitchen().getId() : "null"));
        }
        return users.stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void removeMember(Long memberId) {
        User user = userRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + memberId));
        
        // Remove user from kitchen by setting kitchen to null
        user.setKitchen(null);
        
        // Reset role to default USER role
        Role userRole = roleRepository.findByName("USER")
                .orElseGet(() -> roleRepository.save(Role.builder().name("USER").build()));
        user.setRole(userRole);
        
        userRepository.save(user);
        System.out.println("🚫 Removed member: " + user.getUsername() + " from kitchen");
    }

    private String generateInvitationCode() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
