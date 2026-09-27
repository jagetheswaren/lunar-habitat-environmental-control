package com.lunar.habitat.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.lunar.habitat.enums.TelemetrySource;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

public class TelemetryIngestRequest {

    @JsonAlias({"zoneId", "moduleId", "habitatModule", "zone"})
    private Long habitatZoneId = 1L;

    @NotNull(message = "Atmospheric pressure is required")
    @PositiveOrZero(message = "Pressure must be positive or zero")
    private BigDecimal atmosphericPressureKpa;

    @NotNull(message = "Water purity percent is required")
    @PositiveOrZero(message = "Water purity must be positive or zero")
    private BigDecimal waterPurityPercent;

    @PositiveOrZero(message = "Oxygen consumption must be positive or zero")
    private BigDecimal oxygenConsumptionM3 = BigDecimal.ZERO;

    @PositiveOrZero(message = "Water consumption must be positive or zero")
    private BigDecimal waterConsumptionLiters = BigDecimal.ZERO;

    @PositiveOrZero(message = "CO2 level must be positive or zero")
    private BigDecimal co2LevelPpm = new BigDecimal("400.0000");

    @JsonAlias({"o2Level", "o2PartialPressureKpa", "oxygenLevel", "o2LevelPercent"})
    private BigDecimal o2PartialPressureKpa = new BigDecimal("21.0000");

    private BigDecimal temperatureCelsius = new BigDecimal("22.0000");

    @PositiveOrZero(message = "Humidity must be positive or zero")
    @JsonAlias({"relativeHumidityPercent", "relativeHumidity", "humidity"})
    private BigDecimal humidityPercent = new BigDecimal("45.0000");

    private TelemetrySource source = TelemetrySource.SENSOR;

    public TelemetryIngestRequest() {}

    public Long getHabitatZoneId() {
        return habitatZoneId != null ? habitatZoneId : 1L;
    }

    public void setHabitatZoneId(Long habitatZoneId) {
        this.habitatZoneId = habitatZoneId != null ? habitatZoneId : 1L;
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

    public BigDecimal getO2PartialPressureKpa() {
        return o2PartialPressureKpa;
    }

    public void setO2PartialPressureKpa(BigDecimal o2PartialPressureKpa) {
        this.o2PartialPressureKpa = o2PartialPressureKpa;
    }

    public TelemetrySource getSource() {
        return source;
    }

    public void setSource(TelemetrySource source) {
        this.source = source;
    }
}
