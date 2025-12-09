package com.innogent.pantry_mind.repository;

import com.innogent.pantry_mind.entity.SuggestionRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SuggestionRuleRepository extends JpaRepository<SuggestionRule, Long> {
    
    @Query("SELECT sr FROM SuggestionRule sr WHERE sr.kitchen.id = :kitchenId AND sr.isActive = true")
    List<SuggestionRule> findActiveRulesByKitchen(@Param("kitchenId") Long kitchenId);
    
    Optional<SuggestionRule> findByCanonicalNameAndKitchenId(String canonicalName, Long kitchenId);
}
