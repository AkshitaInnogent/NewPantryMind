package com.innogent.pantry_mind.service;

import com.innogent.pantry_mind.entity.Notification;
import java.util.List;

public interface NotificationService {
    void notifyUserRemoved(Long userId);
    void notifyMemberAdded(Long kitchenId, String memberName);
    void notifyMemberRemoved(Long kitchenId, String memberName);
    void sendInventoryAlert(Long kitchenId, String alertType, String message, Long relatedItemId);
    List<Notification> getRecentAlerts(Long kitchenId);
    void markAsRead(Long notificationId);
}