package com.lunar.habitat.controller.api;

import com.lunar.habitat.dto.request.MaintenanceRequest;
import com.lunar.habitat.entity.EquipmentMaintenance;
import com.lunar.habitat.enums.MaintenanceStatus;
import com.lunar.habitat.service.EquipmentMaintenanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/lunar/maintenance")
@Tag(name = "Equipment Maintenance", description = "Scrubber Servicing and Life-Support Maintenance Activities API")
public class MaintenanceApiController {

    private final EquipmentMaintenanceService equipmentMaintenanceService;

    public MaintenanceApiController(EquipmentMaintenanceService equipmentMaintenanceService) {
        this.equipmentMaintenanceService = equipmentMaintenanceService;
    }

    @PostMapping
    @Operation(summary = "Schedule Maintenance", description = "Schedules maintenance for CO2 scrubbers, water processors, or atmospheric valves")
    public ResponseEntity<EquipmentMaintenance> scheduleMaintenance(@Valid @RequestBody MaintenanceRequest request) {
        EquipmentMaintenance created = equipmentMaintenanceService.scheduleMaintenance(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    @Operation(summary = "Search Maintenance Records", description = "Retrieves paginated maintenance records with zone and status filtering")
    public ResponseEntity<Page<EquipmentMaintenance>> searchMaintenance(
            @RequestParam(required = false) Long zoneId,
            @RequestParam(required = false) MaintenanceStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(equipmentMaintenanceService.searchMaintenance(zoneId, status, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Maintenance Record by ID", description = "Retrieves maintenance details by ID")
    public ResponseEntity<EquipmentMaintenance> getMaintenanceById(@PathVariable Long id) {
        return ResponseEntity.ok(equipmentMaintenanceService.getMaintenanceById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Maintenance Details", description = "Updates scheduled maintenance specifications")
    public ResponseEntity<EquipmentMaintenance> updateMaintenance(
            @PathVariable Long id,
            @Valid @RequestBody MaintenanceRequest request) {
        return ResponseEntity.ok(equipmentMaintenanceService.updateMaintenance(id, request));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update Maintenance Status", description = "Transitions status (SCHEDULED -> IN_PROGRESS -> COMPLETED)")
    public ResponseEntity<EquipmentMaintenance> updateStatus(
            @PathVariable Long id,
            @RequestParam MaintenanceStatus status) {
        return ResponseEntity.ok(equipmentMaintenanceService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Maintenance Record", description = "Removes a scheduled maintenance record")
    public ResponseEntity<Void> deleteMaintenance(@PathVariable Long id) {
        equipmentMaintenanceService.deleteMaintenance(id);
        return ResponseEntity.noContent().build();
    }
}
