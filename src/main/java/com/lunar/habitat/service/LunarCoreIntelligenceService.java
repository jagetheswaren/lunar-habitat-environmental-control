package com.lunar.habitat.service;

import com.lunar.habitat.dto.v2.DiagnosticQueryResponse;
import com.lunar.habitat.dto.v2.LunarCoreHealthResponse;
import com.lunar.habitat.dto.v2.TelemetryV2Response;
import com.lunar.habitat.entity.EnvironmentalAlert;
import com.lunar.habitat.entity.EquipmentMaintenance;
import com.lunar.habitat.entity.HabitatZone;
import com.lunar.habitat.entity.Telemetry;
import com.lunar.habitat.enums.AlertSeverity;
import com.lunar.habitat.enums.AlertStatus;
import com.lunar.habitat.enums.MaintenanceStatus;
import com.lunar.habitat.repository.EnvironmentalAlertRepository;
import com.lunar.habitat.repository.EquipmentMaintenanceRepository;
import com.lunar.habitat.repository.HabitatZoneRepository;
import com.lunar.habitat.repository.TelemetryRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class LunarCoreIntelligenceService {

    private final TelemetryRepository telemetryRepository;
    private final EnvironmentalAlertRepository alertRepository;
    private final EquipmentMaintenanceRepository maintenanceRepository;
    private final HabitatZoneRepository zoneRepository;

    public LunarCoreIntelligenceService(TelemetryRepository telemetryRepository,
                                        EnvironmentalAlertRepository alertRepository,
                                        EquipmentMaintenanceRepository maintenanceRepository,
                                        HabitatZoneRepository zoneRepository) {
        this.telemetryRepository = telemetryRepository;
        this.alertRepository = alertRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.zoneRepository = zoneRepository;
    }

    public LunarCoreHealthResponse calculateHabitatHealth() {
        Optional<Telemetry> latestOpt = telemetryRepository.findTopByOrderByRecordedAtDesc();

        // 1. Atmosphere Score (Weight 30%)
        int atmosphereScore = 95;
        if (latestOpt.isPresent()) {
            Telemetry t = latestOpt.get();
            double pressure = t.getAtmosphericPressureKpa() != null ? t.getAtmosphericPressureKpa().doubleValue() : 101.3;
            double co2 = t.getCo2LevelPpm() != null ? t.getCo2LevelPpm().doubleValue() : 450.0;

            int pressureScore = 100;
            double pressureDev = Math.abs(pressure - 101.32);
            if (pressureDev > 6.0) pressureScore = 55;
            else if (pressureDev > 3.0) pressureScore = 80;
            else if (pressureDev > 1.5) pressureScore = 92;

            int co2Score = 100;
            if (co2 > 1200) co2Score = 40;
            else if (co2 > 950) co2Score = 65;
            else if (co2 > 800) co2Score = 85;
            else if (co2 > 600) co2Score = 94;

            atmosphereScore = (pressureScore + co2Score) / 2;
        }

        // 2. Water Score (Weight 15%)
        int waterScore = 99;
        if (latestOpt.isPresent()) {
            double waterPurity = latestOpt.get().getWaterPurityPercent() != null ?
                    latestOpt.get().getWaterPurityPercent().doubleValue() : 99.4;
            if (waterPurity >= 99.0) waterScore = 99;
            else if (waterPurity >= 98.0) waterScore = 91;
            else if (waterPurity >= 95.0) waterScore = 75;
            else waterScore = 50;
        }

        // 3. Life Support Score (Weight 25%)
        long activeCritical = alertRepository.countByStatusAndSeverity(AlertStatus.OPEN, AlertSeverity.CRITICAL)
                + alertRepository.countByStatusAndSeverity(AlertStatus.ACKNOWLEDGED, AlertSeverity.CRITICAL);
        long activeWarning = alertRepository.countByStatusAndSeverity(AlertStatus.OPEN, AlertSeverity.WARNING)
                + alertRepository.countByStatusAndSeverity(AlertStatus.ACKNOWLEDGED, AlertSeverity.WARNING);

        int lifeSupportScore = 100 - (int) (activeCritical * 25 + activeWarning * 8);
        if (lifeSupportScore < 30) lifeSupportScore = 30;
        if (lifeSupportScore > 100) lifeSupportScore = 100;

        // 4. Resources Score (Weight 10%)
        int resourcesScore = 92;

        // 5. Maintenance Score (Weight 10%)
        List<EquipmentMaintenance> maintenanceList = maintenanceRepository.findAll();
        int maintenanceScore = 90;
        if (!maintenanceList.isEmpty()) {
            long completed = maintenanceList.stream()
                    .filter(m -> m.getStatus() == MaintenanceStatus.COMPLETED)
                    .count();
            maintenanceScore = (int) Math.min(100, Math.max(65, (completed * 100) / maintenanceList.size()));
        }

        // 6. Power Score (Weight 10%)
        int powerScore = (activeCritical > 0) ? 88 : 96;

        // Overall Weighted Composite
        int overallIndex = (int) Math.round(
                (atmosphereScore * 0.30) +
                (lifeSupportScore * 0.25) +
                (waterScore * 0.15) +
                (powerScore * 0.10) +
                (resourcesScore * 0.10) +
                (maintenanceScore * 0.10)
        );

        String status = "OPTIMAL";
        if (overallIndex < 65 || activeCritical > 0) status = "CRITICAL";
        else if (overallIndex < 80 || activeWarning > 0) status = "ELEVATED_RISK";
        else if (overallIndex < 90) status = "NOMINAL";

        String scrubberStatus = (latestOpt.isPresent() && latestOpt.get().isScrubberAutoAdjusted())
                ? "BOOST_MODE" : "NORMAL";
        String powerGridStatus = (powerScore >= 90) ? "STABLE" : "BACKUP_ENGAGED";

        List<String> insights = new ArrayList<>();
        if (activeCritical > 0) {
            insights.add("CRITICAL alert active in life-support sector: Automated scrubber and reclamation overrides engaged.");
        }
        if (atmosphereScore < 85) {
            insights.add("Atmospheric variance detected: CO2 or pressure stabilization cycle recommended.");
        }
        if (waterScore >= 98) {
            insights.add("Water reclamation loop operating at high efficiency (>=98.0% nominal).");
        }
        if (insights.isEmpty()) {
            insights.add("All lunar base environmental systems and resource circuits are operating within nominal thresholds.");
        }

        return new LunarCoreHealthResponse(
                overallIndex, status, atmosphereScore, waterScore, lifeSupportScore,
                resourcesScore, maintenanceScore, powerScore, activeCritical, activeWarning,
                scrubberStatus, powerGridStatus, LocalDateTime.now(), insights
        );
    }

    public DiagnosticQueryResponse diagnoseQuery(String rawQuery) {
        String q = (rawQuery == null) ? "" : rawQuery.toLowerCase();
        LocalDateTime now = LocalDateTime.now();

        Optional<Telemetry> latestOpt = telemetryRepository.findTopByOrderByRecordedAtDesc();
        Map<String, Object> snapshot = new HashMap<>();
        latestOpt.ifPresent(t -> {
            snapshot.put("pressureKpa", t.getAtmosphericPressureKpa());
            snapshot.put("co2LevelPpm", t.getCo2LevelPpm());
            snapshot.put("waterPurity", t.getWaterPurityPercent());
            snapshot.put("temperatureC", t.getTemperatureCelsius());
            snapshot.put("humidity", t.getHumidityPercent());
            snapshot.put("zone", t.getHabitatZone() != null ? t.getHabitatZone().getName() : "Dome Alpha");
            snapshot.put("scrubberAutoAdjusted", t.isScrubberAutoAdjusted());
        });

        // 1. Critical / Why / Dome Alpha queries
        if (q.contains("critical") || q.contains("why") || q.contains("dome alpha") || q.contains("dome")) {
            List<EnvironmentalAlert> alerts = alertRepository.findByStatusOrderByCreatedAtDesc(AlertStatus.OPEN);
            if (alerts.isEmpty()) {
                alerts = alertRepository.findByStatusOrderByCreatedAtDesc(AlertStatus.ACKNOWLEDGED);
            }

            if (!alerts.isEmpty()) {
                EnvironmentalAlert top = alerts.get(0);
                String ans = String.format("Habitat module [%s] triggered a %s state due to threshold violation: %s. " +
                                "The automated threshold engine immediately activated life-support countermeasures (Scrubber Cycle & Vent Valves).",
                        top.getHabitatZone() != null ? top.getHabitatZone().getName() : "Dome Alpha",
                        top.getSeverity(),
                        top.getMessage());

                return new DiagnosticQueryResponse(
                        rawQuery, now, ans, top.getSeverity().name(),
                        Arrays.asList(
                                "Alert ID #" + top.getId() + " status: " + top.getStatus(),
                                "Alert Type: " + top.getAlertType(),
                                "Automated Scrubber Response: ENGAGED"
                        ),
                        Arrays.asList(
                                "Acknowledge alert in Mission Control console",
                                "Verify scrubber canister sorption rate",
                                "Execute equilibrium test via Telemetry Post"
                        ),
                        snapshot
                );
            } else {
                return new DiagnosticQueryResponse(
                        rawQuery, now,
                        "Habitat Dome Alpha is currently in NOMINAL status. Atmospheric pressure is 101.3 kPa, CO2 is within safe limits, and all life-support loops are operational.",
                        "NOMINAL",
                        Collections.singletonList("No active critical or warning incidents detected."),
                        Collections.singletonList("Continue scheduled orbital telemetry logging."),
                        snapshot
                );
            }
        }

        // 2. CO2 / Abnormal / Air queries
        if (q.contains("co2") || q.contains("abnormal") || q.contains("carbon") || q.contains("air")) {
            BigDecimal co2 = latestOpt.map(Telemetry::getCo2LevelPpm).orElse(BigDecimal.valueOf(450));
            boolean abnormal = co2.compareTo(BigDecimal.valueOf(800)) > 0;

            String ans = String.format("Current CO₂ concentration is %s PPM (%s). " +
                            "Safe baseline threshold is 800 PPM; critical ceiling is 950 PPM. " +
                            "Secondary regenerative amine scrubber loop status is %s.",
                    co2,
                    abnormal ? "ELEVATED" : "OPTIMAL",
                    abnormal ? "ACTIVE REGENERATION" : "STANDBY NOMINAL");

            return new DiagnosticQueryResponse(
                    rawQuery, now, ans, abnormal ? "WARNING" : "NOMINAL",
                    Arrays.asList(
                            "Latest Telemetry CO2: " + co2 + " PPM",
                            "Automated Scrubber threshold: 950 PPM"
                    ),
                    Arrays.asList(
                            "Check secondary scrubbers if CO2 exceeds 900 PPM",
                            "Log manual atmospheric sample via Operations Console"
                    ),
                    snapshot
            );
        }

        // 3. Maintenance / Equipment queries
        if (q.contains("maintenance") || q.contains("equipment") || q.contains("repair") || q.contains("work order")) {
            List<EquipmentMaintenance> pending = maintenanceRepository.findAll().stream()
                    .filter(m -> m.getStatus() != MaintenanceStatus.COMPLETED)
                    .collect(Collectors.toList());

            String ans = String.format("There are currently %d active/scheduled maintenance items across lunar habitat modules. " +
                            "Priorities include life-support scrubber filter checks, electrolysis membrane inspection, and pump calibration.",
                    pending.size());

            List<String> evidence = pending.stream()
                    .limit(4)
                    .map(m -> String.format("%s (%s): %s [Status: %s]",
                            m.getEquipmentName(),
                            m.getHabitatZone() != null ? m.getHabitatZone().getName() : "Sector",
                            m.getMaintenanceType(),
                            m.getStatus()))
                    .collect(Collectors.toList());

            return new DiagnosticQueryResponse(
                    rawQuery, now, ans, pending.isEmpty() ? "NOMINAL" : "INFO",
                    evidence.isEmpty() ? Collections.singletonList("All preventive maintenance cycles are up to date.") : evidence,
                    Arrays.asList(
                            "Review scheduled work orders in Maintenance tab",
                            "Verify spare parts inventory in Resource Inventory"
                    ),
                    snapshot
            );
        }

        // 4. Default / Overall Summary
        LunarCoreHealthResponse health = calculateHabitatHealth();
        String ans = String.format("Lunar Habitat Operations Summary: Overall Health Index is %d/100 (%s). " +
                        "Atmosphere: %d/100, Water: %d/100, Life Support: %d/100, Power: %d/100, Resources: %d/100, Maintenance: %d/100. " +
                        "Active Critical Alerts: %d, Warnings: %d. Scrubber system is in %s state.",
                health.getOverallIndex(), health.getStatus(),
                health.getAtmosphereScore(), health.getWaterScore(), health.getLifeSupportScore(),
                health.getPowerScore(), health.getResourcesScore(), health.getMaintenanceScore(),
                health.getActiveCriticalAlerts(), health.getActiveWarningAlerts(),
                health.getScrubberStatus());

        return new DiagnosticQueryResponse(
                rawQuery, now, ans, health.getStatus(),
                health.getOperationalInsights(),
                Arrays.asList(
                        "Monitor real-time 3D Digital Twin for sector heatmaps",
                        "Audit double-entry financial ledger for orbital resource billing"
                ),
                snapshot
        );
    }
}
