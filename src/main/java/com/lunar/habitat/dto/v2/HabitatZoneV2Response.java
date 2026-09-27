package com.lunar.habitat.dto.v2;

public class HabitatZoneV2Response {

    private Long id;
    private String code;
    private String name;
    private String type;
    private Integer targetCapacity;
    private Boolean isPressurized;
    private Boolean isHabitable;
    private String status; // NOMINAL, WARNING, CRITICAL

    // 3D coordinates & Digital Twin attributes
    private double positionX;
    private double positionY;
    private double positionZ;
    private String primarySystem;

    // Attached live telemetry
    private TelemetryV2Response currentTelemetry;
    private long activeAlertsCount;

    public HabitatZoneV2Response() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Integer getTargetCapacity() { return targetCapacity; }
    public void setTargetCapacity(Integer targetCapacity) { this.targetCapacity = targetCapacity; }

    public Boolean getIsPressurized() { return isPressurized; }
    public void setIsPressurized(Boolean isPressurized) { this.isPressurized = isPressurized; }

    public Boolean getIsHabitable() { return isHabitable; }
    public void setIsHabitable(Boolean isHabitable) { this.isHabitable = isHabitable; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public double getPositionX() { return positionX; }
    public void setPositionX(double positionX) { this.positionX = positionX; }

    public double getPositionY() { return positionY; }
    public void setPositionY(double positionY) { this.positionY = positionY; }

    public double getPositionZ() { return positionZ; }
    public void setPositionZ(double positionZ) { this.positionZ = positionZ; }

    public String getPrimarySystem() { return primarySystem; }
    public void setPrimarySystem(String primarySystem) { this.primarySystem = primarySystem; }

    public TelemetryV2Response getCurrentTelemetry() { return currentTelemetry; }
    public void setCurrentTelemetry(TelemetryV2Response currentTelemetry) { this.currentTelemetry = currentTelemetry; }

    public long getActiveAlertsCount() { return activeAlertsCount; }
    public void setActiveAlertsCount(long activeAlertsCount) { this.activeAlertsCount = activeAlertsCount; }
}
