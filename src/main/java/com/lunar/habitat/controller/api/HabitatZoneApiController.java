package com.lunar.habitat.controller.api;

import com.lunar.habitat.dto.request.HabitatZoneRequest;
import com.lunar.habitat.entity.HabitatZone;
import com.lunar.habitat.service.HabitatZoneService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lunar/zones")
@Tag(name = "Habitat Zones", description = "Habitat Dome and Module Configuration API")
public class HabitatZoneApiController {

    private final HabitatZoneService habitatZoneService;

    public HabitatZoneApiController(HabitatZoneService habitatZoneService) {
        this.habitatZoneService = habitatZoneService;
    }

    @GetMapping
    @Operation(summary = "List All Zones", description = "Retrieves all configured lunar habitat zones and modules")
    public ResponseEntity<List<HabitatZone>> getAllZones() {
        return ResponseEntity.ok(habitatZoneService.getAllZones());
    }

    @GetMapping("/active")
    @Operation(summary = "List Active Zones", description = "Retrieves all operational habitat zones")
    public ResponseEntity<List<HabitatZone>> getActiveZones() {
        return ResponseEntity.ok(habitatZoneService.getAllZones());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Zone by ID", description = "Retrieves zone details by ID")
    public ResponseEntity<HabitatZone> getZoneById(@PathVariable Long id) {
        return ResponseEntity.ok(habitatZoneService.getZoneById(id));
    }

    @PostMapping
    @Operation(summary = "Create Zone", description = "Registers a new lunar habitat zone")
    public ResponseEntity<HabitatZone> createZone(@Valid @RequestBody HabitatZoneRequest request) {
        HabitatZone created = habitatZoneService.createZone(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Zone", description = "Modifies existing habitat zone configuration")
    public ResponseEntity<HabitatZone> updateZone(@PathVariable Long id, @Valid @RequestBody HabitatZoneRequest request) {
        return ResponseEntity.ok(habitatZoneService.updateZone(id, request));
    }
}
