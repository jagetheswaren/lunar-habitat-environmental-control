package com.lunar.habitat.service.impl;

import com.lunar.habitat.entity.EnvironmentalAlert;
import com.lunar.habitat.enums.AlertSeverity;
import com.lunar.habitat.enums.AlertStatus;
import com.lunar.habitat.enums.AuditAction;
import com.lunar.habitat.exception.InvalidStatusTransitionException;
import com.lunar.habitat.exception.ResourceNotFoundException;
import com.lunar.habitat.repository.EnvironmentalAlertRepository;
import com.lunar.habitat.security.SecurityUtils;
import com.lunar.habitat.service.AlertService;
import com.lunar.habitat.service.AuditLogService;
import com.lunar.habitat.service.TelemetryStreamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class AlertServiceImpl implements AlertService {

    private final EnvironmentalAlertRepository alertRepository;
    private final AuditLogService auditLogService;
    private final TelemetryStreamService telemetryStreamService;

    public AlertServiceImpl(EnvironmentalAlertRepository alertRepository,
                            AuditLogService auditLogService,
                            @Autowired(required = false) TelemetryStreamService telemetryStreamService) {
        this.alertRepository = alertRepository;
        this.auditLogService = auditLogService;
        this.telemetryStreamService = telemetryStreamService;
    }

    @Override
    public EnvironmentalAlert createAlert(EnvironmentalAlert alert) {
        EnvironmentalAlert saved = alertRepository.save(alert);
        auditLogService.log(AuditAction.THRESHOLD_ALERT, "EnvironmentalAlert", saved.getId().toString(),
                "Triggered alert [" + saved.getSeverity() + "]: " + saved.getMessage());

        broadcastAlertChange("CREATED", saved);
        return saved;
    }

    @Override
    public EnvironmentalAlert acknowledgeAlert(Long id, String acknowledgedBy) {
        EnvironmentalAlert alert = getAlertById(id);
        if (alert.getStatus() == AlertStatus.RESOLVED) {
            throw new InvalidStatusTransitionException("Cannot acknowledge an already resolved alert");
        }
        alert.setStatus(AlertStatus.ACKNOWLEDGED);
        alert.setAcknowledgedAt(LocalDateTime.now());
        alert.setAcknowledgedBy(acknowledgedBy != null ? acknowledgedBy : SecurityUtils.getCurrentUsername());

        EnvironmentalAlert saved = alertRepository.save(alert);
        auditLogService.log(AuditAction.ACKNOWLEDGE, "EnvironmentalAlert", id.toString(),
                "Acknowledged alert by " + saved.getAcknowledgedBy());

        broadcastAlertChange("ACKNOWLEDGED", saved);
        return saved;
    }

    @Override
    public EnvironmentalAlert resolveAlert(Long id, String resolvedBy) {
        EnvironmentalAlert alert = getAlertById(id);
        alert.setStatus(AlertStatus.RESOLVED);
        alert.setResolvedAt(LocalDateTime.now());
        alert.setResolvedBy(resolvedBy != null ? resolvedBy : SecurityUtils.getCurrentUsername());

        EnvironmentalAlert saved = alertRepository.save(alert);
        auditLogService.log(AuditAction.RESOLVE, "EnvironmentalAlert", id.toString(),
                "Resolved alert by " + saved.getResolvedBy());

        broadcastAlertChange("RESOLVED", saved);
        return saved;
    }

    private void broadcastAlertChange(String eventType, EnvironmentalAlert alert) {
        if (telemetryStreamService != null) {
            try {
                Map<String, Object> data = new HashMap<>();
                data.put("eventType", eventType);
                data.put("id", alert.getId());
                data.put("zoneId", alert.getHabitatZone() != null ? alert.getHabitatZone().getId() : null);
                data.put("zoneName", alert.getHabitatZone() != null ? alert.getHabitatZone().getName() : "Unknown");
                data.put("severity", alert.getSeverity() != null ? alert.getSeverity().name() : "WARNING");
                data.put("status", alert.getStatus() != null ? alert.getStatus().name() : "OPEN");
                data.put("message", alert.getMessage());
                data.put("timestamp", alert.getCreatedAt() != null ? alert.getCreatedAt().toString() : LocalDateTime.now().toString());
                telemetryStreamService.broadcastAlert(data);
            } catch (Exception ignored) {}
        }
    }

    @Override
    @Transactional(readOnly = true)
    public EnvironmentalAlert getAlertById(Long id) {
        return alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Environmental alert not found with ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnvironmentalAlert> getOpenAlerts() {
        return alertRepository.findByStatusOrderByCreatedAtDesc(AlertStatus.OPEN);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EnvironmentalAlert> searchAlerts(AlertStatus status, AlertSeverity severity, Long zoneId, Pageable pageable) {
        return alertRepository.searchAlerts(status, severity, zoneId, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public long countOpenAlerts() {
        return alertRepository.countByStatus(AlertStatus.OPEN);
    }

    @Override
    @Transactional(readOnly = true)
    public long countCriticalAlerts() {
        return alertRepository.countByStatusAndSeverity(AlertStatus.OPEN, AlertSeverity.CRITICAL);
    }
}
