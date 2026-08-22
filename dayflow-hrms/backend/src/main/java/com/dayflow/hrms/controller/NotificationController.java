package com.dayflow.hrms.controller;

import com.dayflow.hrms.dto.common.ApiResponse;
import com.dayflow.hrms.dto.notification.NotificationDto;
import com.dayflow.hrms.security.UserPrincipal;
import com.dayflow.hrms.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getMyNotifications(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<NotificationDto> notifications = notificationService.getUserNotifications(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("Notifications retrieved", notifications));
    }

    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getUnreadNotifications(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<NotificationDto> unread = notificationService.getUnreadNotifications(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("Unread notifications retrieved", unread));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationDto>> markAsRead(@PathVariable("id") Long id,
                                                                   @AuthenticationPrincipal UserPrincipal currentUser) {
        NotificationDto notification = notificationService.markAsRead(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("Notification marked as read", notification));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(@AuthenticationPrincipal UserPrincipal currentUser) {
        notificationService.markAllAsRead(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("All notifications marked as read"));
    }
}
