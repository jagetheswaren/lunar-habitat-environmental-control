package com.lunar.habitat.service.impl;

import com.lunar.habitat.entity.AuditLog;
import com.lunar.habitat.enums.AuditAction;
import com.lunar.habitat.repository.AuditLogRepository;
import com.lunar.habitat.security.SecurityUtils;
import com.lunar.habitat.service.AuditLogService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuditLogServiceImpl implements AuditLogService {

    private static final Logger log = LoggerFactory.getLogger(AuditLogServiceImpl.class);
    private final AuditLogRepository auditLogRepository;

    public AuditLogServiceImpl(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String username, AuditAction action, String entityType, String entityId, String oldValue, String newValue, String ipAddress) {
        try {
            AuditLog auditLog = new AuditLog(username, action, entityType, entityId, oldValue, newValue, ipAddress);
            auditLogRepository.save(auditLog);
            log.info("[AUDIT] User: {} | Action: {} | Entity: {} #{} | Value: {}", username, action, entityType, entityId, newValue);
        } catch (Exception e) {
            log.error("Failed to write audit log: {}", e.getMessage());
        }
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(AuditAction action, String entityType, String entityId, String message) {
        String username = SecurityUtils.getCurrentUsername();
        log(username, action, entityType, entityId, null, message, "internal");
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAction(AuditAction action, String entityType, Long entityId, String oldValue, String newValue) {
        String username = SecurityUtils.getCurrentUsername();
        String idStr = entityId != null ? entityId.toString() : "N/A";
        log(username, action, entityType, idStr, oldValue, newValue, "127.0.0.1");
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLog> searchAuditLogs(String username, AuditAction action, String entityType, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return auditLogRepository.searchAuditLogs(username, action, entityType, startDate, endDate, pageable);
    }
}
