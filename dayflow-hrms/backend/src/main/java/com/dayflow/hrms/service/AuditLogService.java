package com.dayflow.hrms.service;

import com.dayflow.hrms.entity.AuditLog;
import java.util.List;

public interface AuditLogService {
    void logAction(Long userId, String action, String entityType, String entityId, String oldValue, String newValue, String ipAddress);
    List<AuditLog> getAllAuditLogs();
    List<AuditLog> getAuditLogsByUser(Long userId);
}
