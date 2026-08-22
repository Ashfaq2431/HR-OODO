package com.dayflow.hrms.service.impl;

import com.dayflow.hrms.entity.AuditLog;
import com.dayflow.hrms.repository.AuditLogRepository;
import com.dayflow.hrms.service.AuditLogService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuditLogServiceImpl implements AuditLogService {

    private static final Logger log = LoggerFactory.getLogger(AuditLogServiceImpl.class);
    private final AuditLogRepository auditLogRepository;

    public AuditLogServiceImpl(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    @Transactional
    public void logAction(Long userId, String action, String entityType, String entityId, String oldValue, String newValue, String ipAddress) {
        try {
            AuditLog auditLog = new AuditLog(userId, action, entityType, entityId, oldValue, newValue, ipAddress);
            auditLogRepository.save(auditLog);
            log.info("[AUDIT] User: {}, Action: {}, Entity: {} ({})", userId, action, entityType, entityId);
        } catch (Exception ex) {
            log.error("Failed to persist audit log: {}", ex.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogsByUser(Long userId) {
        return auditLogRepository.findByUserIdOrderByTimestampDesc(userId);
    }
}
