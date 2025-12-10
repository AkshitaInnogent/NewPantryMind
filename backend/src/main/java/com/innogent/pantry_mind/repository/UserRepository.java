package com.innogent.pantry_mind.repository;

import com.innogent.pantry_mind.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    List<User> findByKitchen_Id(Long kitchenId);
    List<User> findByKitchen_IdAndCreatedAtAfterOrderByCreatedAtDesc(Long kitchenId, LocalDateTime after);
}





