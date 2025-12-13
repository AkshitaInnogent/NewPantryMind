package com.innogent.pantry_mind.repository;

import com.innogent.pantry_mind.entity.Notification;
import com.innogent.pantry_mind.entity.Notification.NotificationSeverity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByKitchenIdOrderByCreatedAtDesc(Long kitchenId);
    List<Notification> findByKitchenIdAndTypeNotInOrderByCreatedAtDesc(Long kitchenId, List<String> excludedTypes);
    long countByKitchenIdAndIsReadFalse(Long kitchenId);
    long countByKitchenIdAndIsReadFalseAndTypeNotIn(Long kitchenId, List<String> excludedTypes);
    List<Notification> findTop10ByKitchenIdOrderByCreatedAtDesc(Long kitchenId);
    boolean existsByKitchenIdAndTypeAndCreatedAtAfter(Long kitchenId, String type, LocalDateTime after);
    long countByKitchenIdAndSeverityAndIsReadFalse(Long kitchenId, NotificationSeverity severity);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.kitchenId = :kitchenId AND (:userId NOT MEMBER OF n.readByUsers OR n.readByUsers IS EMPTY)")
    long countUnreadByUser(@Param("kitchenId") Long kitchenId, @Param("userId") Long userId);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.kitchenId = :kitchenId AND (:userId NOT MEMBER OF n.readByUsers OR n.readByUsers IS EMPTY) AND n.type NOT IN :excludedTypes")
    long countUnreadByUserExcludingTypes(@Param("kitchenId") Long kitchenId, @Param("userId") Long userId, @Param("excludedTypes") List<String> excludedTypes);
    
    long countByKitchenIdAndTypeIn(Long kitchenId, List<String> types);
}