package com.lunar.habitat.controller.api.v2;

import com.lunar.habitat.dto.v2.TelemetryV2Response;
import com.lunar.habitat.entity.Telemetry;
import com.lunar.habitat.repository.TelemetryRepository;
import com.lunar.habitat.service.TelemetryStreamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Optional;

@RestController
@RequestMapping("/api/v2/telemetry")
@Tag(name = "Telemetry V2 & Streaming", description = "Decoupled telemetry DTOs and real-time Server-Sent Events stream")
public class TelemetryV2ApiController {

    private final TelemetryRepository telemetryRepository;
    private final TelemetryStreamService telemetryStreamService;

    public TelemetryV2ApiController(TelemetryRepository telemetryRepository, TelemetryStreamService telemetryStreamService) {
        this.telemetryRepository = telemetryRepository;
        this.telemetryStreamService = telemetryStreamService;
    }

    @GetMapping("/latest")
    @Operation(summary = "Get Latest Telemetry V2", description = "Returns latest environmental telemetry with 3D digital-twin status fields")
    public ResponseEntity<TelemetryV2Response> getLatest() {
        Optional<Telemetry> latest = telemetryRepository.findTopByOrderByRecordedAtDesc();
        return latest.map(t -> ResponseEntity.ok(telemetryStreamService.toV2(t)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Live Telemetry SSE Stream", description = "Subscribes to live Server-Sent Events for real-time sensor updates and alerts")
    public SseEmitter streamTelemetry() {
        return telemetryStreamService.registerEmitter();
    }
}
