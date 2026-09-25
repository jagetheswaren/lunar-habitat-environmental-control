package com.lunar.habitat.service;

import com.lunar.habitat.entity.EnvironmentalAlert;
import com.lunar.habitat.enums.AlertSeverity;
import com.lunar.habitat.enums.AlertStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface AlertService {
    EnvironmentalAlert createAlert(EnvironmentalAlert alert);
    EnvironmentalAlert acknowledgeAlert(Long id, String acknowledgedBy);
    EnvironmentalAlert resolveAlert(Long id, String resolvedBy);
    EnvironmentalAlert getAlertById(Long id);
    List<EnvironmentalAlert> getOpenAlerts();
    Page<EnvironmentalAlert> searchAlerts(AlertStatus status, AlertSeverity severity, Long zoneId, Pageable pageable);
    long countOpenAlerts();
    long countCriticalAlerts();
}
