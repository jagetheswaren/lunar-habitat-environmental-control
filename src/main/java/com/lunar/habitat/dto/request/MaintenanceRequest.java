package com.lunar.habitat.dto.request;

import com.lunar.habitat.enums.MaintenanceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.time.LocalDate;

public class MaintenanceRequest {

    @NotNull(message = "Habitat zone ID is required")
    private Long habitatZoneId;

    @NotBlank(message = "Equipment name is required")
    private String equipmentName;

    @NotNull(message = "Maintenance type is required")
    private MaintenanceType maintenanceType = MaintenanceType.ROUTINE;

    @NotNull(message = "Scheduled date is required")
    private LocalDate scheduledDate = LocalDate.now();

    @PositiveOrZero(message = "Cost must be zero or positive")
    private BigDecimal cost = BigDecimal.ZERO;

    private String notes;

    public MaintenanceRequest() {}

    public Long getHabitatZoneId() {
        return habitatZoneId;
    }

    public void setHabitatZoneId(Long habitatZoneId) {
        this.habitatZoneId = habitatZoneId;
    }

    public String getEquipmentName() {
        return equipmentName;
    }

    public void setEquipmentName(String equipmentName) {
        this.equipmentName = equipmentName;
    }

    public MaintenanceType getMaintenanceType() {
        return maintenanceType;
    }

    public void setMaintenanceType(MaintenanceType maintenanceType) {
        this.maintenanceType = maintenanceType;
    }

    public LocalDate getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(LocalDate scheduledDate) {
        this.scheduledDate = scheduledDate;
    }

    public BigDecimal getCost() {
        return cost;
    }

    public void setCost(BigDecimal cost) {
        this.cost = cost;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
