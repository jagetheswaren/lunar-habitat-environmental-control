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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class AlertServiceImpl implements AlertService {

    private final EnvironmentalAlertRepository alertRepository;
    private final AuditLogService auditLogService;

    public AlertServiceImpl(EnvironmentalAlertRepository alertRepository, AuditLogService auditLogService) {
        this.alertRepository = alertRepository;
        this.auditLogService = auditLogService;
    }

    @Override
    public EnvironmentalAlert createAlert(EnvironmentalAlert alert) {
        EnvironmentalAlert saved = alertRepository.save(alert);
        auditLogService.log(AuditAction.THRESHOLD_ALERT, "EnvironmentalAlert", saved.getId().toString(),
                "Triggered alert [" + saved.getSeverity() + "]: " + saved.getMessage());
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
        return saved;
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
