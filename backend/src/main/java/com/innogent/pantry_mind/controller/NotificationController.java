package com.innogent.pantry_mind.controller;

import com.innogent.pantry_mind.entity.Notification;
import com.innogent.pantry_mind.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin
public class NotificationController {
    
    private final NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(@RequestParam Long kitchenId, @RequestParam(defaultValue = "ADMIN") String userRole) {
        List<Notification> notifications = notificationRepository.findByKitchenIdOrderByCreatedAtDesc(kitchenId);
        
        if ("MEMBER".equals(userRole)) {
            notifications = notifications.stream()
                .filter(n -> !"MEMBER_JOINED".equals(n.getType()) && !"MEMBER_REMOVED".equals(n.getType()))
                .collect(Collectors.toList());
        }
        
        return ResponseEntity.ok(notifications);
    }
    
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(@RequestParam Long kitchenId, @RequestParam(defaultValue = "ADMIN") String userRole) {
        List<Notification> notifications = notificationRepository.findByKitchenIdOrderByCreatedAtDesc(kitchenId);
        
        if ("MEMBER".equals(userRole)) {
            long count = notifications.stream()
                .filter(n -> !n.isRead())
                .filter(n -> !"MEMBER_JOINED".equals(n.getType()) && !"MEMBER_REMOVED".equals(n.getType()))
                .count();
            return ResponseEntity.ok(count);
        } else {
            long count = notificationRepository.countByKitchenIdAndIsReadFalse(kitchenId);
            return ResponseEntity.ok(count);
        }
    }
    
    @PostMapping("/mark-read")
    public ResponseEntity<Void> markAllAsRead(@RequestParam Long kitchenId, @RequestParam(defaultValue = "ADMIN") String userRole) {
        List<Notification> notifications = notificationRepository.findByKitchenIdOrderByCreatedAtDesc(kitchenId);
        
        if ("MEMBER".equals(userRole)) {
            notifications = notifications.stream()
                .filter(n -> !"MEMBER_JOINED".equals(n.getType()) && !"MEMBER_REMOVED".equals(n.getType()))
                .collect(Collectors.toList());
        }
        
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}