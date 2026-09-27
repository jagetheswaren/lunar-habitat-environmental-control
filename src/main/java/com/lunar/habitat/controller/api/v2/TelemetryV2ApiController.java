package com.lunar.habitat.controller.api.v2;

import com.lunar.habitat.dto.request.TelemetryIngestRequest;
import com.lunar.habitat.dto.v2.TelemetryV2Response;
import com.lunar.habitat.entity.Telemetry;
import com.lunar.habitat.repository.TelemetryRepository;
import com.lunar.habitat.service.TelemetryService;
import com.lunar.habitat.service.TelemetryStreamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Optional;

@RestController
@RequestMapping("/api/v2/telemetry")
@Tag(name = "Telemetry V2 & Streaming", description = "Decoupled telemetry DTOs, sensor ingestion, and real-time Server-Sent Events stream")
public class TelemetryV2ApiController {

    private final TelemetryRepository telemetryRepository;
    private final TelemetryService telemetryService;
    private final TelemetryStreamService telemetryStreamService;
    private final com.lunar.habitat.security.JwtTokenProvider jwtTokenProvider;

    public TelemetryV2ApiController(TelemetryRepository telemetryRepository,
                                  TelemetryService telemetryService,
                                  TelemetryStreamService telemetryStreamService,
                                  com.lunar.habitat.security.JwtTokenProvider jwtTokenProvider) {
        this.telemetryRepository = telemetryRepository;
        this.telemetryService = telemetryService;
        this.telemetryStreamService = telemetryStreamService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping
    @Operation(summary = "Ingest Sensor Telemetry V2", description = "Ingests environmental telemetry, evaluates thresholds, triggers automated scrubber and broadcasts live events")
    public ResponseEntity<TelemetryV2Response> ingestTelemetry(@Valid @RequestBody TelemetryIngestRequest request) {
        Telemetry telemetry = telemetryService.ingestTelemetry(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(telemetryStreamService.toV2(telemetry));
    }

    @GetMapping
    @Operation(summary = "Query Telemetry Records V2", description = "Returns paged telemetry records mapped to V2 DTOs")
    public ResponseEntity<Page<TelemetryV2Response>> getAllTelemetry(
            @RequestParam(required = false) Long zoneId,
            @RequestParam(required = false) String status,
            Pageable pageable) {
        Page<Telemetry> page = telemetryService.filterTelemetry(zoneId, status, null, null, null, pageable);
        return ResponseEntity.ok(page.map(telemetryStreamService::toV2));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Telemetry Record V2 by ID", description = "Retrieves single telemetry reading")
    public ResponseEntity<TelemetryV2Response> getById(@PathVariable Long id) {
        Telemetry t = telemetryService.getTelemetryById(id);
        return ResponseEntity.ok(telemetryStreamService.toV2(t));
    }

    @GetMapping("/latest")
    @Operation(summary = "Get Latest Telemetry V2", description = "Returns latest environmental telemetry with 3D digital-twin status fields")
    public ResponseEntity<TelemetryV2Response> getLatest() {
        Optional<Telemetry> latest = telemetryRepository.findTopByOrderByRecordedAtDesc();
        return latest.map(t -> ResponseEntity.ok(telemetryStreamService.toV2(t)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/stream-token")
    @Operation(summary = "Generate Scoped SSE Stream Ticket", description = "Generates a 60-second single-use ticket for secure SSE stream establishment without exposing normal access tokens in URLs")
    public ResponseEntity<java.util.Map<String, Object>> generateStreamTicket(java.security.Principal principal) {
        String username = (principal != null && principal.getName() != null) ? principal.getName() : "operator";
        String ticket = jwtTokenProvider.generateStreamToken(username);
        return ResponseEntity.ok(java.util.Map.of(
            "streamToken", ticket,
            "expiresInSeconds", 60,
            "purpose", "SSE_STREAM_TICKET"
        ));
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Live Telemetry SSE Stream", description = "Subscribes to live Server-Sent Events for real-time sensor updates and alerts")
    public SseEmitter streamTelemetry() {
        return telemetryStreamService.registerEmitter();
    }
}
