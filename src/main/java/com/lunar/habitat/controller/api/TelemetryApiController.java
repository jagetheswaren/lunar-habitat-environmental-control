package com.lunar.habitat.controller.api;

import com.lunar.habitat.dto.request.TelemetryIngestRequest;
import com.lunar.habitat.entity.Telemetry;
import com.lunar.habitat.service.TelemetryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/lunar/telemetry")
@Tag(name = "Environmental Telemetry", description = "Environmental sensor telemetry ingestion and monitoring API")
public class TelemetryApiController {

    private final TelemetryService telemetryService;

    public TelemetryApiController(TelemetryService telemetryService) {
        this.telemetryService = telemetryService;
    }

    @PostMapping
    @Operation(summary = "Ingest Telemetry", description = "Receives sensor or manual environmental readings, evaluates thresholds, triggers automated scrubber adjustments, and persists records in MySQL")
    public ResponseEntity<Telemetry> ingestTelemetry(@Valid @RequestBody TelemetryIngestRequest request) {
        Telemetry ingested = telemetryService.ingestTelemetry(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ingested);
    }

    @GetMapping
    @Operation(summary = "Search Telemetry Records", description = "Retrieves paginated environmental telemetry with multi-criteria filtering")
    public ResponseEntity<Page<Telemetry>> searchTelemetry(
            @RequestParam(required = false) Long zoneId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean scrubberAdjusted,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            Pageable pageable) {
        return ResponseEntity.ok(telemetryService.filterTelemetry(zoneId, status, scrubberAdjusted, start, end, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Telemetry by ID", description = "Retrieves a single telemetry record by primary key")
    public ResponseEntity<Telemetry> getTelemetryById(@PathVariable Long id) {
        return ResponseEntity.ok(telemetryService.getTelemetryById(id));
    }

    @GetMapping("/zone/{zoneId}")
    @Operation(summary = "Get Telemetry History for Zone", description = "Retrieves time-series telemetry records for a specific habitat dome or module")
    public ResponseEntity<List<Telemetry>> getTelemetryByZone(@PathVariable Long zoneId) {
        return ResponseEntity.ok(telemetryService.getByZone(zoneId));
    }

    @GetMapping("/latest/{zoneId}")
    @Operation(summary = "Get Latest Telemetry for Zone", description = "Retrieves the most recent telemetry packet received from a specific habitat zone")
    public ResponseEntity<Telemetry> getLatestTelemetryForZone(@PathVariable Long zoneId) {
        return ResponseEntity.ok(telemetryService.getLatestByZone(zoneId));
    }
}
