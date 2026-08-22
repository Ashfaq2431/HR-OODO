package com.dayflow.hrms.service;

import com.dayflow.hrms.dto.notification.NotificationDto;
import com.dayflow.hrms.enums.NotificationType;
import java.util.List;

public interface NotificationService {
    NotificationDto createNotification(Long userId, String title, String message, NotificationType type);
    void notifyAllAdmins(String title, String message, NotificationType type);
    List<NotificationDto> getUserNotifications(Long userId);
    List<NotificationDto> getUnreadNotifications(Long userId);
    NotificationDto markAsRead(Long notificationId, Long userId);
    void markAllAsRead(Long userId);
    long getUnreadCount(Long userId);
}
