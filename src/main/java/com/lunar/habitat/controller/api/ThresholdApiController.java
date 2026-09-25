package com.lunar.habitat.controller.api;

import com.lunar.habitat.dto.request.ThresholdRequest;
import com.lunar.habitat.entity.EnvironmentalThreshold;
import com.lunar.habitat.service.ThresholdEngineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lunar/thresholds")
@Tag(name = "Environmental Thresholds", description = "Environmental Safety Threshold Engine Configuration API")
public class ThresholdApiController {

    private final ThresholdEngineService thresholdEngineService;

    public ThresholdApiController(ThresholdEngineService thresholdEngineService) {
        this.thresholdEngineService = thresholdEngineService;
    }

    @GetMapping
    @Operation(summary = "List All Thresholds", description = "Retrieves all environmental safety threshold rules")
    public ResponseEntity<List<EnvironmentalThreshold>> getAllThresholds() {
        return ResponseEntity.ok(thresholdEngineService.getAllThresholds());
    }

    @GetMapping("/active")
    @Operation(summary = "List Active Thresholds", description = "Retrieves only currently enabled thresholds")
    public ResponseEntity<List<EnvironmentalThreshold>> getActiveThresholds() {
        return ResponseEntity.ok(thresholdEngineService.getActiveThresholds());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Threshold by ID", description = "Retrieves threshold details by ID")
    public ResponseEntity<EnvironmentalThreshold> getThresholdById(@PathVariable Long id) {
        return ResponseEntity.ok(thresholdEngineService.getThresholdById(id));
    }

    @PostMapping
    @Operation(summary = "Create Threshold", description = "Creates a new environmental parameter safety threshold")
    public ResponseEntity<EnvironmentalThreshold> createThreshold(@Valid @RequestBody ThresholdRequest request) {
        EnvironmentalThreshold created = thresholdEngineService.createThreshold(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Threshold", description = "Modifies existing environmental safety threshold")
    public ResponseEntity<EnvironmentalThreshold> updateThreshold(@PathVariable Long id, @Valid @RequestBody ThresholdRequest request) {
        return ResponseEntity.ok(thresholdEngineService.updateThreshold(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Threshold", description = "Removes a threshold configuration")
    public ResponseEntity<Void> deleteThreshold(@PathVariable Long id) {
        thresholdEngineService.deleteThreshold(id);
        return ResponseEntity.noContent().build();
    }
}
