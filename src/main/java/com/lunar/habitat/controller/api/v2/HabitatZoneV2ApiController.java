package com.lunar.habitat.controller.api.v2;

import com.lunar.habitat.dto.v2.HabitatZoneV2Response;
import com.lunar.habitat.entity.HabitatZone;
import com.lunar.habitat.entity.Telemetry;
import com.lunar.habitat.enums.AlertStatus;
import com.lunar.habitat.repository.EnvironmentalAlertRepository;
import com.lunar.habitat.repository.HabitatZoneRepository;
import com.lunar.habitat.repository.TelemetryRepository;
import com.lunar.habitat.service.TelemetryStreamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v2/zones")
@Tag(name = "Habitat Zones Digital Twin V2", description = "3D Digital Twin habitat modules with real-time telemetry overlays")
public class HabitatZoneV2ApiController {

    private final HabitatZoneRepository zoneRepository;
    private final TelemetryRepository telemetryRepository;
    private final EnvironmentalAlertRepository alertRepository;
    private final TelemetryStreamService telemetryStreamService;
    private final com.lunar.habitat.service.HabitatZoneService habitatZoneService;

    public HabitatZoneV2ApiController(HabitatZoneRepository zoneRepository,
                                     TelemetryRepository telemetryRepository,
                                     EnvironmentalAlertRepository alertRepository,
                                     TelemetryStreamService telemetryStreamService,
                                     com.lunar.habitat.service.HabitatZoneService habitatZoneService) {
        this.zoneRepository = zoneRepository;
        this.telemetryRepository = telemetryRepository;
        this.alertRepository = alertRepository;
        this.telemetryStreamService = telemetryStreamService;
        this.habitatZoneService = habitatZoneService;
    }

    @GetMapping
    @Operation(summary = "List Habitat Zones V2", description = "Returns all habitat modules with 3D coordinates and telemetry attachments")
    public ResponseEntity<List<HabitatZoneV2Response>> getAllZones() {
        List<HabitatZone> zones = zoneRepository.findAll();
        List<HabitatZoneV2Response> responseList = new ArrayList<>();

        for (int i = 0; i < zones.size(); i++) {
            HabitatZone z = zones.get(i);
            HabitatZoneV2Response dto = new HabitatZoneV2Response();
            dto.setId(z.getId());
            dto.setCode(z.getCode());
            dto.setName(z.getName());
            dto.setType("LIVING_QUARTERS");
            dto.setTargetCapacity(12);
            dto.setIsPressurized(true);
            dto.setIsHabitable(true);

            // 3D coordinates & layout assignment
            if ("DOME-ALPHA".equalsIgnoreCase(z.getCode()) || i == 0) {
                dto.setPositionX(-2.5);
                dto.setPositionY(0.0);
                dto.setPositionZ(-1.0);
                dto.setPrimarySystem("Life Support & Crew Quarters");
            } else if ("DOME-BETA".equalsIgnoreCase(z.getCode()) || i == 1) {
                dto.setPositionX(2.2);
                dto.setPositionY(0.0);
                dto.setPositionZ(-1.5);
                dto.setPrimarySystem("Hydroponic Biomass & O2 Generation");
            } else if ("SECTOR-GAMMA".equalsIgnoreCase(z.getCode()) || i == 2) {
                dto.setPositionX(0.0);
                dto.setPositionY(0.0);
                dto.setPositionZ(2.5);
                dto.setPrimarySystem("Water Purification & Sabatier Reactor");
            } else {
                dto.setPositionX(3.5);
                dto.setPositionY(0.0);
                dto.setPositionZ(2.0);
                dto.setPrimarySystem("Solar Photovoltaic & Cryo Power Grid");
            }

            // Attached latest telemetry for this zone
            Optional<Telemetry> tOpt = telemetryRepository.findFirstByHabitatZoneIdOrderByRecordedAtDesc(z.getId());
            if (tOpt.isEmpty()) {
                tOpt = telemetryRepository.findTopByOrderByRecordedAtDesc();
            }

            if (tOpt.isPresent()) {
                dto.setCurrentTelemetry(telemetryStreamService.toV2(tOpt.get()));
                dto.setStatus(dto.getCurrentTelemetry().getZoneStatus());
            } else {
                dto.setStatus("NOMINAL");
            }

            // Alerts count
            dto.setActiveAlertsCount(alertRepository.countByStatus(AlertStatus.OPEN));
            responseList.add(dto);
        }

        return ResponseEntity.ok(responseList);
    }

    @GetMapping("/{code}")
    @Operation(summary = "Get Habitat Zone V2 by Code", description = "Retrieves single zone digital twin specification")
    public ResponseEntity<HabitatZoneV2Response> getZoneByCode(@PathVariable String code) {
        return getAllZones().getBody().stream()
                .filter(z -> z.getCode().equalsIgnoreCase(code) || String.valueOf(z.getId()).equals(code))
                .findFirst()
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @Operation(summary = "Create Zone V2", description = "Registers a new lunar habitat zone")
    public ResponseEntity<com.lunar.habitat.entity.HabitatZone> createZone(@jakarta.validation.Valid @RequestBody com.lunar.habitat.dto.request.HabitatZoneRequest request) {
        com.lunar.habitat.entity.HabitatZone created = habitatZoneService.createZone(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Zone V2", description = "Modifies existing habitat zone configuration")
    public ResponseEntity<com.lunar.habitat.entity.HabitatZone> updateZone(@PathVariable Long id, @jakarta.validation.Valid @RequestBody com.lunar.habitat.dto.request.HabitatZoneRequest request) {
        return ResponseEntity.ok(habitatZoneService.updateZone(id, request));
    }
}
