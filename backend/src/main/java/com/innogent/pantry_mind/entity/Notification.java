package com.innogent.pantry_mind.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

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
    @Builder.Default
    private NotificationSeverity severity = NotificationSeverity.INFO;
    
    private Long relatedItemId;
    
    @Column(nullable = false)
    @Builder.Default
    private boolean isRead = false;
    
    @ElementCollection
    @CollectionTable(name = "notification_read_by", joinColumns = @JoinColumn(name = "notification_id"))
    @Column(name = "user_id")
    @Builder.Default
    private Set<Long> readByUsers = new HashSet<>();
    
    @ElementCollection
    @CollectionTable(name = "notification_deleted_by", joinColumns = @JoinColumn(name = "notification_id"))
    @Column(name = "user_id")
    @Builder.Default
    private Set<Long> deletedByUsers = new HashSet<>();
    
    @CreationTimestamp
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    public boolean isReadByUser(Long userId) {
        return readByUsers.contains(userId);
    }
    
    public void markAsReadByUser(Long userId) {
        readByUsers.add(userId);
    }
    
    public void markAsDeletedByUser(Long userId) {
        deletedByUsers.add(userId);
    }
    
    public boolean isDeletedByUser(Long userId) {
        return deletedByUsers.contains(userId);
    }
    
    public enum NotificationSeverity {
        INFO, WARNING, CRITICAL
    }
}