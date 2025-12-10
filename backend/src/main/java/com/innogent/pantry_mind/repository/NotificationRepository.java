package com.innogent.pantry_mind.repository;

import com.innogent.pantry_mind.entity.Notification;
import com.innogent.pantry_mind.entity.Notification.NotificationSeverity;
import org.springframework.data.jpa.repository.JpaRepository;
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
}