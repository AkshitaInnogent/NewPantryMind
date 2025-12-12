package com.innogent.pantry_mind.service.impl;

import com.innogent.pantry_mind.entity.Notification;
import com.innogent.pantry_mind.repository.NotificationRepository;
import com.innogent.pantry_mind.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private NotificationRepository notificationRepository;

    @Override
    public void notifyUserRemoved(Long userId) {
        messagingTemplate.convertAndSend("/topic/user/" + userId, "ACCESS_REVOKED");
    }

    @Override
    public void notifyMemberAdded(Long kitchenId, String memberName) {
        Notification notification = Notification.builder()
                .message(memberName + " joined the kitchen")
                .type("MEMBER_JOINED")
                .title("New Member")
                .kitchenId(kitchenId)
                .severity(Notification.NotificationSeverity.INFO)
                .build();
        notificationRepository.save(notification);
        sendWebSocketUpdate(kitchenId, "MEMBER_ADDED", memberName + " joined the kitchen");
    }
    
    @Override
    public void notifyMemberRemoved(Long kitchenId, String memberName) {
        Notification notification = Notification.builder()
                .message(memberName + " left the kitchen")
                .type("MEMBER_REMOVED")
                .title("Member Left")
                .kitchenId(kitchenId)
                .severity(Notification.NotificationSeverity.INFO)
                .build();
        notificationRepository.save(notification);
        sendWebSocketUpdate(kitchenId, "MEMBER_REMOVED", memberName + " left the kitchen");
    }
    
    @Override
    public void sendInventoryAlert(Long kitchenId, String alertType, String message, Long relatedItemId) {
        Notification notification = Notification.builder()
                .kitchenId(kitchenId)
                .type(alertType)
                .title(getAlertTitle(alertType))
                .message(message)
                .severity(determineSeverity(alertType))
                .relatedItemId(relatedItemId)
                .build();
        
        notificationRepository.save(notification);
        sendWebSocketUpdate(kitchenId, alertType, message);
    }
    
    @Override
    public List<Notification> getRecentAlerts(Long kitchenId) {
        return notificationRepository.findTop10ByKitchenIdOrderByCreatedAtDesc(kitchenId);
    }
    
    @Override
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }
    
    private boolean hasRecentAlert(Long kitchenId, String type) {
        java.time.LocalDateTime yesterday = java.time.LocalDateTime.now().minusHours(24);
        return notificationRepository.existsByKitchenIdAndTypeAndCreatedAtAfter(kitchenId, type, yesterday);
    }
    
    private void sendWebSocketUpdate(Long kitchenId, String type, String message) {
        java.util.Map<String, Object> payload = java.util.Map.of(
            "type", type,
            "message", message,
            "timestamp", System.currentTimeMillis()
        );
        
        messagingTemplate.convertAndSend("/topic/kitchen/" + kitchenId + "/alerts", payload);
    }
    
    private Notification.NotificationSeverity determineSeverity(String alertType) {
        return switch (alertType) {
            case "EXPIRY_CRITICAL", "CRITICAL_STOCK", "ITEM_EXPIRED", "ITEMS_EXPIRED" -> Notification.NotificationSeverity.CRITICAL;
            case "EXPIRY_WARNING", "LOW_STOCK" -> Notification.NotificationSeverity.WARNING;
            default -> Notification.NotificationSeverity.INFO;
        };
    }
    
    private String getAlertTitle(String alertType) {
        return switch (alertType) {
            case "EXPIRY_CRITICAL" -> "Items Expiring Soon";
            case "EXPIRY_WARNING" -> "Expiry Warning";
            case "LOW_STOCK" -> "Low Stock Alert";
            case "CRITICAL_STOCK" -> "Critical Stock Level";
            case "ITEM_EXPIRED" -> "Item Expired";
            case "ITEMS_EXPIRED" -> "Items Expired";
            default -> "Notification";
        };
    }
}