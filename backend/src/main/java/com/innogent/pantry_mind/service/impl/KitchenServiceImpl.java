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
import com.innogent.pantry_mind.repository.InventoryRepository;
import com.innogent.pantry_mind.service.KitchenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import com.innogent.pantry_mind.dto.response.UserResponseDTO;
import com.innogent.pantry_mind.mapper.UserMapper;
import com.innogent.pantry_mind.service.NotificationService;

@Service
@RequiredArgsConstructor
@Slf4j
public class KitchenServiceImpl implements KitchenService {
    
    private final KitchenRepository kitchenRepository;
    private final KitchenMapper kitchenMapper;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final NotificationService notificationService;
    private final InventoryRepository inventoryRepository;

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
        
        // Delete all inventory items first
        inventoryRepository.deleteAll(inventoryRepository.findByKitchenId(id));
        
        // Remove all users from kitchen
        List<User> users = userRepository.findByKitchen_Id(id);
        Role userRole = roleRepository.findByName("USER")
                .orElseGet(() -> roleRepository.save(Role.builder().name("USER").build()));
        
        for (User user : users) {
            user.setKitchen(null);
            user.setRole(userRole);
            userRepository.save(user);
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
        log.info("Admin user created: {} for kitchen: {}", savedUser.getUsername(), savedUser.getKitchen() != null ? savedUser.getKitchen().getId() : "null");
        
        return kitchenMapper.toResponse(savedKitchen);
    }

    @Override
    public KitchenResponseDTO joinByCode(Long userId, String invitationCode) {
        // Find the user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        // Find kitchen by invitation code
        Kitchen kitchen = kitchenRepository.findByInvitationCode(invitationCode)
                .orElseThrow(() -> new ResourceNotFoundException("Kitchen not found with code: " + invitationCode));
        
        // Update user role to MEMBER and assign kitchen
        Role memberRole = roleRepository.findByName("MEMBER")
                .orElseGet(() -> roleRepository.save(Role.builder().name("MEMBER").build()));
        
        user.setRole(memberRole);
        user.setKitchen(kitchen);
        User savedUser = userRepository.save(user);
        log.info("Member user joined: {} for kitchen: {}", savedUser.getUsername(), savedUser.getKitchen() != null ? savedUser.getKitchen().getId() : "null");
        
        // Send real-time notification to kitchen members
        notificationService.notifyMemberAdded(kitchen.getId(), user.getName() != null ? user.getName() : user.getEmail());
        
        return kitchenMapper.toResponse(kitchen);
    }

    @Override
    public List<UserResponseDTO> getKitchenMembers(Long kitchenId) {
        log.debug("Looking for members in kitchen ID: {}", kitchenId);
        List<User> users = userRepository.findByKitchen_Id(kitchenId);
        log.debug("Found {} users in kitchen {}", users.size(), kitchenId);
        return users.stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void removeMember(Long memberId) {
        User user = userRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + memberId));
        
        // Get kitchen ID and member name before removing
        Long kitchenId = user.getKitchen() != null ? user.getKitchen().getId() : null;
        String memberName = user.getName() != null ? user.getName() : user.getEmail();
        
        // Remove user from kitchen by setting kitchen to null
        user.setKitchen(null);
        
        // Reset role to default USER role
        Role userRole = roleRepository.findByName("USER")
                .orElseGet(() -> roleRepository.save(Role.builder().name("USER").build()));
        user.setRole(userRole);
        
        userRepository.save(user);
        
        // Send real-time notification
        if (kitchenId != null) {
            notificationService.notifyMemberRemoved(kitchenId, memberName);
        }
        notificationService.notifyUserRemoved(memberId);
        
        log.info("Removed member: {} from kitchen", user.getUsername());
    }

    @Override
    public List<UserResponseDTO> getRecentMembers(Long kitchenId) {
        LocalDateTime oneDayAgo = LocalDateTime.now().minusDays(1);
        List<User> recentMembers = userRepository.findByKitchen_IdAndCreatedAtAfterOrderByCreatedAtDesc(kitchenId, oneDayAgo);
        return recentMembers.stream()
                .map(userMapper::toResponse)
                .collect(Collectors.toList());
    }

    private String generateInvitationCode() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
