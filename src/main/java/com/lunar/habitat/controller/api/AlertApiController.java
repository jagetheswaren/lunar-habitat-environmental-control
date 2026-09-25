package com.lunar.habitat.controller.api;

import com.lunar.habitat.entity.EnvironmentalAlert;
import com.lunar.habitat.enums.AlertSeverity;
import com.lunar.habitat.enums.AlertStatus;
import com.lunar.habitat.service.AlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lunar/alerts")
@Tag(name = "Environmental Alerts", description = "Alert lifecycle and incident management API")
public class AlertApiController {

    private final AlertService alertService;

    public AlertApiController(AlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping
    @Operation(summary = "Search Alerts", description = "Retrieves paginated environmental alerts filtered by status, severity, and zone")
    public ResponseEntity<Page<EnvironmentalAlert>> searchAlerts(
            @RequestParam(required = false) AlertStatus status,
            @RequestParam(required = false) AlertSeverity severity,
            @RequestParam(required = false) Long zoneId,
            Pageable pageable) {
        return ResponseEntity.ok(alertService.searchAlerts(status, severity, zoneId, pageable));
    }

    @GetMapping("/open")
    @Operation(summary = "Get Open Alerts", description = "Retrieves all currently active, unresolved environmental alerts for the operations console")
    public ResponseEntity<List<EnvironmentalAlert>> getOpenAlerts() {
        return ResponseEntity.ok(alertService.getOpenAlerts());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Alert by ID", description = "Retrieves details of a specific alert")
    public ResponseEntity<EnvironmentalAlert> getAlertById(@PathVariable Long id) {
        return ResponseEntity.ok(alertService.getAlertById(id));
    }

    @PutMapping("/{id}/acknowledge")
    @Operation(summary = "Acknowledge Alert", description = "Transitions alert from OPEN to ACKNOWLEDGED with operator audit log")
    public ResponseEntity<EnvironmentalAlert> acknowledgeAlert(@PathVariable Long id) {
        return ResponseEntity.ok(alertService.acknowledgeAlert(id, com.lunar.habitat.security.SecurityUtils.getCurrentUsername()));
    }

    @PutMapping("/{id}/resolve")
    @Operation(summary = "Resolve Alert", description = "Transitions alert to RESOLVED with operator audit log")
    public ResponseEntity<EnvironmentalAlert> resolveAlert(@PathVariable Long id) {
        return ResponseEntity.ok(alertService.resolveAlert(id, com.lunar.habitat.security.SecurityUtils.getCurrentUsername()));
    }
}
