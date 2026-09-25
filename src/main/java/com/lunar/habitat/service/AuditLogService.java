package com.lunar.habitat.service;

import com.lunar.habitat.entity.AuditLog;
import com.lunar.habitat.enums.AuditAction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;

public interface AuditLogService {
    void log(String username, AuditAction action, String entityType, String entityId, String oldValue, String newValue, String ipAddress);
    void log(AuditAction action, String entityType, String entityId, String message);
    void logAction(AuditAction action, String entityType, Long entityId, String oldValue, String newValue);
    Page<AuditLog> searchAuditLogs(String username, AuditAction action, String entityType, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
}
