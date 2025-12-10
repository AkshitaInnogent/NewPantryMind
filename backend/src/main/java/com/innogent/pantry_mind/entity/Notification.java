package com.innogent.pantry_mind.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long kitchenId;
    
    private Long userId;
    
    @Column(nullable = false)
    private String type;
    
    private String title;
    
    @Column(nullable = false)
    private String message;
    
    @Enumerated(EnumType.STRING)
    private NotificationSeverity severity = NotificationSeverity.INFO;
    
    private Long relatedItemId;
    
    @Column(nullable = false)
    private boolean isRead = false;
    
    @CreationTimestamp
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    public enum NotificationSeverity {
        INFO, WARNING, CRITICAL
    }
}