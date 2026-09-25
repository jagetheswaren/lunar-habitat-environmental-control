package com.lunar.habitat.service;

import com.lunar.habitat.dto.request.TelemetryIngestRequest;
import com.lunar.habitat.entity.Telemetry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;
import java.util.List;

public interface TelemetryService {
    Telemetry ingestTelemetry(TelemetryIngestRequest request);
    Telemetry getTelemetryById(Long id);
    Telemetry getLatestByZone(Long zoneId);
    List<Telemetry> getByZone(Long zoneId);
    Page<Telemetry> filterTelemetry(Long zoneId, String status, Boolean scrubberAdjusted, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
}
