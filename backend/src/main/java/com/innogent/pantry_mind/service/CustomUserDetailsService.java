package com.innogent.pantry_mind.service;

import com.innogent.pantry_mind.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    
    private final UserRepository userRepository;
    
    @Override
    @Transactional(readOnly = true)  // Add this annotation
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        com.innogent.pantry_mind.entity.User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
        
        String roleName = user.getRole() != null ? user.getRole().getName() : "USER";
        
        return User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .authorities(roleName)
                .build();
    }
}
