package com.lunar.habitat.service.impl;

import com.lunar.habitat.dto.request.TelemetryIngestRequest;
import com.lunar.habitat.entity.HabitatZone;
import com.lunar.habitat.entity.Telemetry;
import com.lunar.habitat.enums.AuditAction;
import com.lunar.habitat.exception.ResourceNotFoundException;
import com.lunar.habitat.repository.HabitatZoneRepository;
import com.lunar.habitat.repository.TelemetryRepository;
import com.lunar.habitat.service.AuditLogService;
import com.lunar.habitat.service.TelemetryService;
import com.lunar.habitat.service.ThresholdEngineService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class TelemetryServiceImpl implements TelemetryService {

    private final TelemetryRepository telemetryRepository;
    private final HabitatZoneRepository habitatZoneRepository;
    private final ThresholdEngineService thresholdEngineService;
    private final AuditLogService auditLogService;

    public TelemetryServiceImpl(TelemetryRepository telemetryRepository,
                                HabitatZoneRepository habitatZoneRepository,
                                ThresholdEngineService thresholdEngineService,
                                AuditLogService auditLogService) {
        this.telemetryRepository = telemetryRepository;
        this.habitatZoneRepository = habitatZoneRepository;
        this.thresholdEngineService = thresholdEngineService;
        this.auditLogService = auditLogService;
    }

    @Override
    public Telemetry ingestTelemetry(TelemetryIngestRequest request) {
        HabitatZone zone = habitatZoneRepository.findById(request.getHabitatZoneId())
                .orElseThrow(() -> new ResourceNotFoundException("Habitat zone not found with ID: " + request.getHabitatZoneId()));

        Telemetry telemetry = new Telemetry();
        telemetry.setHabitatZone(zone);
        telemetry.setAtmosphericPressureKpa(request.getAtmosphericPressureKpa());
        telemetry.setWaterPurityPercent(request.getWaterPurityPercent());
        telemetry.setOxygenConsumptionM3(request.getOxygenConsumptionM3());
        telemetry.setWaterConsumptionLiters(request.getWaterConsumptionLiters());
        telemetry.setCo2LevelPpm(request.getCo2LevelPpm());
        telemetry.setTemperatureCelsius(request.getTemperatureCelsius());
        telemetry.setHumidityPercent(request.getHumidityPercent());
        telemetry.setSource(request.getSource());
        telemetry.setRecordedAt(LocalDateTime.now());

        // Dynamic threshold evaluation and automated control command logic
        thresholdEngineService.evaluate(telemetry);

        Telemetry saved = telemetryRepository.save(telemetry);
        auditLogService.log(AuditAction.CREATE, "Telemetry", saved.getId().toString(),
                "Ingested telemetry for " + zone.getName() + " with status: " + saved.getStatus());
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public Telemetry getTelemetryById(Long id) {
        return telemetryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Telemetry record not found with ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public Telemetry getLatestByZone(Long zoneId) {
        return telemetryRepository.findFirstByHabitatZoneIdOrderByRecordedAtDesc(zoneId)
                .orElseThrow(() -> new ResourceNotFoundException("No telemetry records found for zone ID: " + zoneId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Telemetry> getByZone(Long zoneId) {
        return telemetryRepository.findByHabitatZoneIdOrderByRecordedAtDesc(zoneId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Telemetry> filterTelemetry(Long zoneId, String status, Boolean scrubberAdjusted, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return telemetryRepository.filterTelemetry(zoneId, status, scrubberAdjusted, startDate, endDate, pageable);
    }
}
