package com.lunar.habitat.service.impl;

import com.lunar.habitat.dto.request.ThresholdRequest;
import com.lunar.habitat.entity.EnvironmentalAlert;
import com.lunar.habitat.entity.EnvironmentalThreshold;
import com.lunar.habitat.entity.Telemetry;
import com.lunar.habitat.enums.AlertSeverity;
import com.lunar.habitat.enums.AuditAction;
import com.lunar.habitat.exception.ResourceNotFoundException;
import com.lunar.habitat.repository.EnvironmentalThresholdRepository;
import com.lunar.habitat.service.AlertService;
import com.lunar.habitat.service.AuditLogService;
import com.lunar.habitat.service.ThresholdEngineService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class ThresholdEngineServiceImpl implements ThresholdEngineService {

    private static final Logger log = LoggerFactory.getLogger(ThresholdEngineServiceImpl.class);

    private final EnvironmentalThresholdRepository thresholdRepository;
    private final AlertService alertService;
    private final AuditLogService auditLogService;

    public ThresholdEngineServiceImpl(EnvironmentalThresholdRepository thresholdRepository,
                                      AlertService alertService,
                                      AuditLogService auditLogService) {
        this.thresholdRepository = thresholdRepository;
        this.alertService = alertService;
        this.auditLogService = auditLogService;
    }

    @Override
    public void evaluate(Telemetry telemetry) {
        List<EnvironmentalThreshold> activeThresholds = thresholdRepository.findByEnabledTrue();
        boolean hasCritical = false;
        boolean hasWarning = false;
        boolean autoAdjustScrubber = false;

        for (EnvironmentalThreshold t : activeThresholds) {
            BigDecimal value = null;
            String paramName = t.getParameter().name();

            switch (t.getParameter()) {
                case ATMOSPHERIC_PRESSURE -> value = telemetry.getAtmosphericPressureKpa();
                case WATER_PURITY -> value = telemetry.getWaterPurityPercent();
                case CO2_LEVEL -> value = telemetry.getCo2LevelPpm();
                case TEMPERATURE -> value = telemetry.getTemperatureCelsius();
                case HUMIDITY -> value = telemetry.getHumidityPercent();
            }

            if (value == null) continue;

            boolean violated = false;
            String breachDetail = "";

            if (t.getMinimumValue() != null && value.compareTo(t.getMinimumValue()) < 0) {
                violated = true;
                breachDetail = String.format("Below minimum threshold %.2f %s (Current: %.2f %s)",
                        t.getMinimumValue(), t.getUnit(), value, t.getUnit());
            } else if (t.getMaximumValue() != null && value.compareTo(t.getMaximumValue()) > 0) {
                violated = true;
                breachDetail = String.format("Above maximum threshold %.2f %s (Current: %.2f %s)",
                        t.getMaximumValue(), t.getUnit(), value, t.getUnit());
            }

            if (violated) {
                if (t.getSeverity() == AlertSeverity.CRITICAL) {
                    hasCritical = true;
                } else {
                    hasWarning = true;
                }

                // Automated control rule logic: CO2 level high or Pressure low triggers automated scrubber adjustment
                if (paramName.equals("CO2_LEVEL") || paramName.equals("ATMOSPHERIC_PRESSURE")) {
                    autoAdjustScrubber = true;
                }

                String alertMsg = String.format("Zone [%s] %s breach: %s. Action: %s",
                        telemetry.getHabitatZone().getName(), paramName, breachDetail,
                        t.getActionDescription() != null ? t.getActionDescription() : "Immediate operator verification requested");

                EnvironmentalAlert alert = new EnvironmentalAlert(
                        telemetry.getHabitatZone(),
                        telemetry,
                        paramName + "_BREACH",
                        t.getSeverity(),
                        alertMsg
                );
                alertService.createAlert(alert);
            }
        }

        if (hasCritical) {
            telemetry.setStatus("CRITICAL");
        } else if (hasWarning) {
            telemetry.setStatus("WARNING");
        } else {
            telemetry.setStatus("NORMAL");
        }

        if (autoAdjustScrubber) {
            telemetry.setScrubberAutoAdjusted(true);
            telemetry.setScrubberStatus("AUTO_ADJUSTED_BOOST");
            auditLogService.log(AuditAction.CONTROL_ACTION, "Telemetry",
                    telemetry.getHabitatZone().getCode(),
                    "Automated life support control adjustment triggered for " + telemetry.getHabitatZone().getName());
        } else {
            telemetry.setScrubberAutoAdjusted(false);
            telemetry.setScrubberStatus("NORMAL");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnvironmentalThreshold> getAllThresholds() {
        return thresholdRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnvironmentalThreshold> getActiveThresholds() {
        return thresholdRepository.findByEnabledTrue();
    }

    @Override
    public EnvironmentalThreshold createThreshold(ThresholdRequest request) {
        EnvironmentalThreshold threshold = new EnvironmentalThreshold(
                request.getParameter(),
                request.getMinimumValue(),
                request.getMaximumValue(),
                request.getUnit(),
                request.getSeverity(),
                request.getActionDescription());
        threshold.setEnabled(request.isEnabled());
        EnvironmentalThreshold saved = thresholdRepository.save(threshold);
        auditLogService.log(AuditAction.CREATE, "EnvironmentalThreshold", saved.getId().toString(),
                "Created threshold for " + saved.getParameter());
        return saved;
    }

    @Override
    public EnvironmentalThreshold updateThreshold(Long id, ThresholdRequest request) {
        EnvironmentalThreshold threshold = getThresholdById(id);
        threshold.setMinimumValue(request.getMinimumValue());
        threshold.setMaximumValue(request.getMaximumValue());
        threshold.setUnit(request.getUnit());
        threshold.setSeverity(request.getSeverity());
        threshold.setEnabled(request.isEnabled());
        threshold.setActionDescription(request.getActionDescription());

        EnvironmentalThreshold saved = thresholdRepository.save(threshold);
        auditLogService.log(AuditAction.UPDATE, "EnvironmentalThreshold", id.toString(),
                "Updated threshold configuration for " + saved.getParameter());
        return saved;
    }

    @Override
    public void deleteThreshold(Long id) {
        EnvironmentalThreshold threshold = getThresholdById(id);
        thresholdRepository.delete(threshold);
        auditLogService.log(AuditAction.DELETE, "EnvironmentalThreshold", id.toString(),
                "Deleted threshold for " + threshold.getParameter());
    }

    @Override
    @Transactional(readOnly = true)
    public EnvironmentalThreshold getThresholdById(Long id) {
        return thresholdRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Environmental threshold not found with ID: " + id));
    }
}
