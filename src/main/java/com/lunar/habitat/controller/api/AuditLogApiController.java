package com.lunar.habitat.controller.api;

import com.lunar.habitat.entity.AuditLog;
import com.lunar.habitat.enums.AuditAction;
import com.lunar.habitat.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/lunar/audit-logs")
@Tag(name = "Audit Logs", description = "Immutable System and Financial Audit Trails API")
public class AuditLogApiController {

    private final AuditLogService auditLogService;

    public AuditLogApiController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    @Operation(summary = "Search Audit Logs", description = "Retrieves paginated immutable audit logs tracking logins, creates, updates, postings, payments, and approvals")
    public ResponseEntity<Page<AuditLog>> searchAuditLogs(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) AuditAction action,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Pageable pageable) {
        return ResponseEntity.ok(auditLogService.searchAuditLogs(username, action, entityType, startDate, endDate, pageable));
    }
}
