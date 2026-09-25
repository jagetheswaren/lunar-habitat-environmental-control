package com.lunar.habitat.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class EnvironmentalReportResponse {

    private LocalDateTime since;
    private Double averagePressureKpa;
    private BigDecimal minPressureKpa;
    private BigDecimal maxPressureKpa;
    private Double averageWaterPurityPercent;
    private Double averageCo2Ppm;
    private long totalAlerts;
    private long criticalAlerts;
    private long openAlerts;
    private long scrubberAdjustments;
    private String environmentalHealthStatus = "STABLE";

    public EnvironmentalReportResponse() {}

    public LocalDateTime getSince() {
        return since;
    }

    public void setSince(LocalDateTime since) {
        this.since = since;
    }

    public Double getAveragePressureKpa() {
        return averagePressureKpa;
    }

    public void setAveragePressureKpa(Double averagePressureKpa) {
        this.averagePressureKpa = averagePressureKpa;
    }

    public BigDecimal getMinPressureKpa() {
        return minPressureKpa;
    }

    public void setMinPressureKpa(BigDecimal minPressureKpa) {
        this.minPressureKpa = minPressureKpa;
    }

    public BigDecimal getMaxPressureKpa() {
        return maxPressureKpa;
    }

    public void setMaxPressureKpa(BigDecimal maxPressureKpa) {
        this.maxPressureKpa = maxPressureKpa;
    }

    public Double getAverageWaterPurityPercent() {
        return averageWaterPurityPercent;
    }

    public void setAverageWaterPurityPercent(Double averageWaterPurityPercent) {
        this.averageWaterPurityPercent = averageWaterPurityPercent;
    }

    public Double getAverageCo2Ppm() {
        return averageCo2Ppm;
    }

    public void setAverageCo2Ppm(Double averageCo2Ppm) {
        this.averageCo2Ppm = averageCo2Ppm;
    }

    public long getTotalAlerts() {
        return totalAlerts;
    }

    public void setTotalAlerts(long totalAlerts) {
        this.totalAlerts = totalAlerts;
    }

    public long getCriticalAlerts() {
        return criticalAlerts;
    }

    public void setCriticalAlerts(long criticalAlerts) {
        this.criticalAlerts = criticalAlerts;
    }

    public long getOpenAlerts() {
        return openAlerts;
    }

    public void setOpenAlerts(long openAlerts) {
        this.openAlerts = openAlerts;
    }

    public long getScrubberAdjustments() {
        return scrubberAdjustments;
    }

    public void setScrubberAdjustments(long scrubberAdjustments) {
        this.scrubberAdjustments = scrubberAdjustments;
    }

    public String getEnvironmentalHealthStatus() {
        return environmentalHealthStatus;
    }

    public void setEnvironmentalHealthStatus(String environmentalHealthStatus) {
        this.environmentalHealthStatus = environmentalHealthStatus;
    }
}
