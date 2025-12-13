package com.innogent.pantry_mind.repository;

import com.innogent.pantry_mind.entity.Kitchen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KitchenRepository extends JpaRepository<Kitchen, Long> {
    Optional<Kitchen> findByName(String name);
    Optional<Kitchen> findByInvitationCode(String invitationCode);
    
    @Query("SELECT k.id FROM Kitchen k")
    List<Long> findAllKitchenIds();
}
