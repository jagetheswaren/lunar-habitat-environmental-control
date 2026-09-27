package com.lunar.habitat.dto.v2;

import java.time.LocalDateTime;
import java.util.List;

public class LunarCoreHealthResponse {

    private int overallIndex; // 0 - 100
    private String status; // OPTIMAL, NOMINAL, ELEVATED_RISK, CRITICAL
    private int atmosphereScore;
    private int waterScore;
    private int lifeSupportScore;
    private int resourcesScore;
    private int maintenanceScore;
    private int powerScore;
    private long activeCriticalAlerts;
    private long activeWarningAlerts;
    private String scrubberStatus;
    private String powerGridStatus;
    private LocalDateTime timestamp;
    private List<String> operationalInsights;

    public LunarCoreHealthResponse() {}

    public LunarCoreHealthResponse(int overallIndex, String status, int atmosphereScore, int waterScore,
                                   int lifeSupportScore, int resourcesScore, int maintenanceScore, int powerScore,
                                   long activeCriticalAlerts, long activeWarningAlerts, String scrubberStatus,
                                   String powerGridStatus, LocalDateTime timestamp, List<String> operationalInsights) {
        this.overallIndex = overallIndex;
        this.status = status;
        this.atmosphereScore = atmosphereScore;
        this.waterScore = waterScore;
        this.lifeSupportScore = lifeSupportScore;
        this.resourcesScore = resourcesScore;
        this.maintenanceScore = maintenanceScore;
        this.powerScore = powerScore;
        this.activeCriticalAlerts = activeCriticalAlerts;
        this.activeWarningAlerts = activeWarningAlerts;
        this.scrubberStatus = scrubberStatus;
        this.powerGridStatus = powerGridStatus;
        this.timestamp = timestamp;
        this.operationalInsights = operationalInsights;
    }

    public int getOverallIndex() { return overallIndex; }
    public void setOverallIndex(int overallIndex) { this.overallIndex = overallIndex; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getAtmosphereScore() { return atmosphereScore; }
    public void setAtmosphereScore(int atmosphereScore) { this.atmosphereScore = atmosphereScore; }

    public int getWaterScore() { return waterScore; }
    public void setWaterScore(int waterScore) { this.waterScore = waterScore; }

    public int getLifeSupportScore() { return lifeSupportScore; }
    public void setLifeSupportScore(int lifeSupportScore) { this.lifeSupportScore = lifeSupportScore; }

    public int getResourcesScore() { return resourcesScore; }
    public void setResourcesScore(int resourcesScore) { this.resourcesScore = resourcesScore; }

    public int getMaintenanceScore() { return maintenanceScore; }
    public void setMaintenanceScore(int maintenanceScore) { this.maintenanceScore = maintenanceScore; }

    public int getPowerScore() { return powerScore; }
    public void setPowerScore(int powerScore) { this.powerScore = powerScore; }

    public long getActiveCriticalAlerts() { return activeCriticalAlerts; }
    public void setActiveCriticalAlerts(long activeCriticalAlerts) { this.activeCriticalAlerts = activeCriticalAlerts; }

    public long getActiveWarningAlerts() { return activeWarningAlerts; }
    public void setActiveWarningAlerts(long activeWarningAlerts) { this.activeWarningAlerts = activeWarningAlerts; }

    public String getScrubberStatus() { return scrubberStatus; }
    public void setScrubberStatus(String scrubberStatus) { this.scrubberStatus = scrubberStatus; }

    public String getPowerGridStatus() { return powerGridStatus; }
    public void setPowerGridStatus(String powerGridStatus) { this.powerGridStatus = powerGridStatus; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public List<String> getOperationalInsights() { return operationalInsights; }
    public void setOperationalInsights(List<String> operationalInsights) { this.operationalInsights = operationalInsights; }
}
