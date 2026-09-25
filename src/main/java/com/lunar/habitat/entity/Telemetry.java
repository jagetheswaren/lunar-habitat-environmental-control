package com.lunar.habitat.entity;

import com.lunar.habitat.enums.TelemetrySource;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "telemetry")
public class Telemetry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "habitat_zone_id", nullable = false)
    private HabitatZone habitatZone;

    @Column(name = "atmospheric_pressure_kpa", nullable = false, precision = 19, scale = 4)
    private BigDecimal atmosphericPressureKpa;

    @Column(name = "water_purity_percent", nullable = false, precision = 19, scale = 4)
    private BigDecimal waterPurityPercent;

    @Column(name = "oxygen_consumption_m3", nullable = false, precision = 19, scale = 4)
    private BigDecimal oxygenConsumptionM3 = BigDecimal.ZERO;

    @Column(name = "water_consumption_liters", nullable = false, precision = 19, scale = 4)
    private BigDecimal waterConsumptionLiters = BigDecimal.ZERO;

    @Column(name = "co2_level_ppm", nullable = false, precision = 19, scale = 4)
    private BigDecimal co2LevelPpm = new BigDecimal("400.0000");

    @Column(name = "temperature_celsius", nullable = false, precision = 19, scale = 4)
    private BigDecimal temperatureCelsius = new BigDecimal("22.0000");

    @Column(name = "humidity_percent", nullable = false, precision = 19, scale = 4)
    private BigDecimal humidityPercent = new BigDecimal("45.0000");

    @Column(name = "scrubber_status", nullable = false, length = 50)
    private String scrubberStatus = "NORMAL";

    @Column(name = "scrubber_auto_adjusted", nullable = false)
    private boolean scrubberAutoAdjusted = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TelemetrySource source = TelemetrySource.SENSOR;

    @Column(nullable = false, length = 30)
    private String status = "NORMAL";

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt = LocalDateTime.now();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Telemetry() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public HabitatZone getHabitatZone() {
        return habitatZone;
    }

    public void setHabitatZone(HabitatZone habitatZone) {
        this.habitatZone = habitatZone;
    }

    public BigDecimal getAtmosphericPressureKpa() {
        return atmosphericPressureKpa;
    }

    public void setAtmosphericPressureKpa(BigDecimal atmosphericPressureKpa) {
        this.atmosphericPressureKpa = atmosphericPressureKpa;
    }

    public BigDecimal getWaterPurityPercent() {
        return waterPurityPercent;
    }

    public void setWaterPurityPercent(BigDecimal waterPurityPercent) {
        this.waterPurityPercent = waterPurityPercent;
    }

    public BigDecimal getOxygenConsumptionM3() {
        return oxygenConsumptionM3;
    }

    public void setOxygenConsumptionM3(BigDecimal oxygenConsumptionM3) {
        this.oxygenConsumptionM3 = oxygenConsumptionM3;
    }

    public BigDecimal getWaterConsumptionLiters() {
        return waterConsumptionLiters;
    }

    public void setWaterConsumptionLiters(BigDecimal waterConsumptionLiters) {
        this.waterConsumptionLiters = waterConsumptionLiters;
    }

    public BigDecimal getCo2LevelPpm() {
        return co2LevelPpm;
    }

    public void setCo2LevelPpm(BigDecimal co2LevelPpm) {
        this.co2LevelPpm = co2LevelPpm;
    }

    public BigDecimal getTemperatureCelsius() {
        return temperatureCelsius;
    }

    public void setTemperatureCelsius(BigDecimal temperatureCelsius) {
        this.temperatureCelsius = temperatureCelsius;
    }

    public BigDecimal getHumidityPercent() {
        return humidityPercent;
    }

    public void setHumidityPercent(BigDecimal humidityPercent) {
        this.humidityPercent = humidityPercent;
    }

    public String getScrubberStatus() {
        return scrubberStatus;
    }

    public void setScrubberStatus(String scrubberStatus) {
        this.scrubberStatus = scrubberStatus;
    }

    public boolean isScrubberAutoAdjusted() {
        return scrubberAutoAdjusted;
    }

    public void setScrubberAutoAdjusted(boolean scrubberAutoAdjusted) {
        this.scrubberAutoAdjusted = scrubberAutoAdjusted;
    }

    public TelemetrySource getSource() {
        return source;
    }

    public void setSource(TelemetrySource source) {
        this.source = source;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
