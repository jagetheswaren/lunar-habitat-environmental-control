package com.lunar.habitat.dto.v2;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TelemetryV2Response {

    private Long id;
    private Long habitatZoneId;
    private String zoneCode;
    private String zoneName;
    private BigDecimal atmosphericPressureKpa;
    private BigDecimal co2LevelPpm;
    private BigDecimal waterPurityPercent;
    private BigDecimal temperatureCelsius;
    private BigDecimal humidityPercent;
    private BigDecimal oxygenConsumptionRateLpm;
    private BigDecimal waterConsumptionRateLpm;
    private String source;
    private LocalDateTime recordedAt;

    // Derived operational statuses for 3D digital twin
    private String oxygenStatus;   // NOMINAL, DEPLETED, HIGH
    private String scrubberStatus; // NORMAL, HIGH_INTENSITY, BOOST, FAULT
    private String powerStatus;    // STABLE, FLUCTUATING, CRITICAL
    private String zoneStatus;     // NOMINAL, WARNING, CRITICAL

    public TelemetryV2Response() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getHabitatZoneId() { return habitatZoneId; }
    public void setHabitatZoneId(Long habitatZoneId) { this.habitatZoneId = habitatZoneId; }

    public String getZoneCode() { return zoneCode; }
    public void setZoneCode(String zoneCode) { this.zoneCode = zoneCode; }

    public String getZoneName() { return zoneName; }
    public void setZoneName(String zoneName) { this.zoneName = zoneName; }

    public BigDecimal getAtmosphericPressureKpa() { return atmosphericPressureKpa; }
    public void setAtmosphericPressureKpa(BigDecimal atmosphericPressureKpa) { this.atmosphericPressureKpa = atmosphericPressureKpa; }

    public BigDecimal getCo2LevelPpm() { return co2LevelPpm; }
    public void setCo2LevelPpm(BigDecimal co2LevelPpm) { this.co2LevelPpm = co2LevelPpm; }

    public BigDecimal getWaterPurityPercent() { return waterPurityPercent; }
    public void setWaterPurityPercent(BigDecimal waterPurityPercent) { this.waterPurityPercent = waterPurityPercent; }

    public BigDecimal getTemperatureCelsius() { return temperatureCelsius; }
    public void setTemperatureCelsius(BigDecimal temperatureCelsius) { this.temperatureCelsius = temperatureCelsius; }

    public BigDecimal getHumidityPercent() { return humidityPercent; }
    public void setHumidityPercent(BigDecimal humidityPercent) { this.humidityPercent = humidityPercent; }

    public BigDecimal getOxygenConsumptionRateLpm() { return oxygenConsumptionRateLpm; }
    public void setOxygenConsumptionRateLpm(BigDecimal oxygenConsumptionRateLpm) { this.oxygenConsumptionRateLpm = oxygenConsumptionRateLpm; }

    public BigDecimal getWaterConsumptionRateLpm() { return waterConsumptionRateLpm; }
    public void setWaterConsumptionRateLpm(BigDecimal waterConsumptionRateLpm) { this.waterConsumptionRateLpm = waterConsumptionRateLpm; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public LocalDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(LocalDateTime recordedAt) { this.recordedAt = recordedAt; }

    public String getOxygenStatus() { return oxygenStatus; }
    public void setOxygenStatus(String oxygenStatus) { this.oxygenStatus = oxygenStatus; }

    public String getScrubberStatus() { return scrubberStatus; }
    public void setScrubberStatus(String scrubberStatus) { this.scrubberStatus = scrubberStatus; }

    public String getPowerStatus() { return powerStatus; }
    public void setPowerStatus(String powerStatus) { this.powerStatus = powerStatus; }

    public String getZoneStatus() { return zoneStatus; }
    public void setZoneStatus(String zoneStatus) { this.zoneStatus = zoneStatus; }
}
