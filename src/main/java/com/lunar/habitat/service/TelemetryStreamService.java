package com.lunar.habitat.service;

import com.lunar.habitat.dto.v2.TelemetryV2Response;
import com.lunar.habitat.entity.Telemetry;
import com.lunar.habitat.repository.TelemetryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class TelemetryStreamService {

    private static final Logger log = LoggerFactory.getLogger(TelemetryStreamService.class);
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();
    private final TelemetryRepository telemetryRepository;

    public TelemetryStreamService(TelemetryRepository telemetryRepository) {
        this.telemetryRepository = telemetryRepository;
    }

    public SseEmitter registerEmitter() {
        // 30-minute timeout for mission control sessions
        SseEmitter emitter = new SseEmitter(1800000L);

        emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> {
            emitters.remove(emitter);
            emitter.complete();
        });
        emitter.onError(e -> emitters.remove(emitter));

        // Send initial connect greeting and current state
        try {
            emitter.send(SseEmitter.event()
                    .name("CONNECTED")
                    .data(Map.of(
                            "status", "CONNECTED",
                            "message", "Live Server-Sent Events stream active to Lunar Orbital Core",
                            "timestamp", LocalDateTime.now().toString()
                    )));

            telemetryRepository.findTopByOrderByRecordedAtDesc().ifPresent(t -> {
                try {
                    emitter.send(SseEmitter.event().name("TELEMETRY").data(toV2(t)));
                } catch (IOException ignored) {}
            });
        } catch (IOException e) {
            emitters.remove(emitter);
        }

        return emitter;
    }

    public void broadcastTelemetry(TelemetryV2Response telemetry) {
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("TELEMETRY").data(telemetry));
            } catch (Exception e) {
                emitters.remove(emitter);
            }
        }
    }

    public void broadcastAlert(Map<String, Object> alertData) {
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("ALERT").data(alertData));
            } catch (Exception e) {
                emitters.remove(emitter);
            }
        }
    }

    @Scheduled(fixedRate = 10000)
    public void sendHeartbeat() {
        if (emitters.isEmpty()) return;

        telemetryRepository.findTopByOrderByRecordedAtDesc().ifPresent(t -> {
            TelemetryV2Response dto = toV2(t);
            for (SseEmitter emitter : emitters) {
                try {
                    emitter.send(SseEmitter.event().name("HEARTBEAT").data(dto));
                } catch (Exception e) {
                    emitters.remove(emitter);
                }
            }
        });
    }

    public TelemetryV2Response toV2(Telemetry t) {
        TelemetryV2Response dto = new TelemetryV2Response();
        dto.setId(t.getId());
        if (t.getHabitatZone() != null) {
            dto.setHabitatZoneId(t.getHabitatZone().getId());
            dto.setZoneCode(t.getHabitatZone().getCode());
            dto.setZoneName(t.getHabitatZone().getName());
        } else {
            dto.setZoneCode("DOME-ALPHA");
            dto.setZoneName("Habitat Dome Alpha");
        }
        dto.setAtmosphericPressureKpa(t.getAtmosphericPressureKpa());
        dto.setCo2LevelPpm(t.getCo2LevelPpm());
        dto.setWaterPurityPercent(t.getWaterPurityPercent());
        dto.setTemperatureCelsius(t.getTemperatureCelsius());
        dto.setHumidityPercent(t.getHumidityPercent());
        dto.setOxygenConsumptionRateLpm(t.getOxygenConsumptionM3());
        dto.setWaterConsumptionRateLpm(t.getWaterConsumptionLiters());
        dto.setSource(t.getSource() != null ? t.getSource().name() : "ORBITAL_STATION");
        dto.setRecordedAt(t.getRecordedAt());

        // Derive Digital Twin operational statuses
        double co2 = t.getCo2LevelPpm() != null ? t.getCo2LevelPpm().doubleValue() : 450.0;
        double pres = t.getAtmosphericPressureKpa() != null ? t.getAtmosphericPressureKpa().doubleValue() : 101.3;

        dto.setOxygenStatus(pres >= 98.0 && pres <= 104.0 ? "NOMINAL" : "REGULATING");
        dto.setScrubberStatus(t.isScrubberAutoAdjusted() ? "BOOST_MODE" :
                (co2 > 800 ? "HIGH_INTENSITY" : (t.getScrubberStatus() != null ? t.getScrubberStatus() : "NORMAL")));
        dto.setPowerStatus("STABLE");

        if (co2 > 950 || pres < 95.0 || pres > 108.0) {
            dto.setZoneStatus("CRITICAL");
        } else if (co2 > 800 || pres < 98.0 || pres > 104.0) {
            dto.setZoneStatus("WARNING");
        } else {
            dto.setZoneStatus("NOMINAL");
        }

        return dto;
    }
}
