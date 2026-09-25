package com.lunar.habitat.controller.api;

import com.lunar.habitat.dto.response.ResourceReportResponse;
import com.lunar.habitat.service.ResourceConsumptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/lunar/resources")
@Tag(name = "Resource Consumption", description = "Oxygen and Water resource consumption analytics derived from telemetry")
public class ResourceConsumptionApiController {

    private final ResourceConsumptionService resourceConsumptionService;

    public ResourceConsumptionApiController(ResourceConsumptionService resourceConsumptionService) {
        this.resourceConsumptionService = resourceConsumptionService;
    }

    @GetMapping("/consumption")
    @Operation(summary = "Get Consumption Report", description = "Retrieves aggregated resource usage over a custom time window")
    public ResponseEntity<ResourceReportResponse> getConsumption(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        LocalDateTime s = start != null ? start : LocalDateTime.now().minusDays(30);
        LocalDateTime e = end != null ? end : LocalDateTime.now();
        return ResponseEntity.ok(resourceConsumptionService.getAggregatedConsumptionReport(s, e));
    }

    @GetMapping("/consumption/daily")
    @Operation(summary = "Get Daily Consumption", description = "Calculates oxygen and water usage for the past 24 hours")
    public ResponseEntity<ResourceReportResponse> getDailyConsumption() {
        return ResponseEntity.ok(resourceConsumptionService.getDailyConsumptionReport());
    }

    @GetMapping("/consumption/monthly")
    @Operation(summary = "Get Monthly Consumption", description = "Calculates oxygen and water usage for the current calendar month")
    public ResponseEntity<ResourceReportResponse> getMonthlyConsumption() {
        return ResponseEntity.ok(resourceConsumptionService.getMonthlyConsumptionReport());
    }

    @GetMapping("/consumption/zone/{zoneId}")
    @Operation(summary = "Get Zone Consumption", description = "Retrieves current month usage specifically for a given habitat zone")
    public ResponseEntity<Map<String, Object>> getZoneConsumption(@PathVariable Long zoneId) {
        LocalDateTime start = LocalDateTime.now().minusDays(30);
        LocalDateTime end = LocalDateTime.now();
        BigDecimal oxygen = resourceConsumptionService.getOxygenConsumption(zoneId, start, end);
        BigDecimal water = resourceConsumptionService.getWaterConsumption(zoneId, start, end);

        Map<String, Object> result = new HashMap<>();
        result.put("habitatZoneId", zoneId);
        result.put("oxygenConsumedM3", oxygen);
        result.put("waterConsumedLiters", water);
        result.put("periodStart", start);
        result.put("periodEnd", end);

        return ResponseEntity.ok(result);
    }
}
