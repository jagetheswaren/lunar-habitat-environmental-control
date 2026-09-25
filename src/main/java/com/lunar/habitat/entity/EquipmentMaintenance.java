package com.lunar.habitat.entity;

import com.lunar.habitat.enums.MaintenanceStatus;
import com.lunar.habitat.enums.MaintenanceType;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "equipment_maintenances")
public class EquipmentMaintenance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "habitat_zone_id", nullable = false)
    private HabitatZone habitatZone;

    @Column(name = "equipment_name", nullable = false, length = 150)
    private String equipmentName;

    @Enumerated(EnumType.STRING)
    @Column(name = "maintenance_type", nullable = false, length = 30)
    private MaintenanceType maintenanceType = MaintenanceType.ROUTINE;

    @Column(name = "scheduled_date", nullable = false)
    private LocalDate scheduledDate = LocalDate.now();

    @Column(name = "completed_date")
    private LocalDate completedDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private MaintenanceStatus status = MaintenanceStatus.SCHEDULED;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal cost = BigDecimal.ZERO;

    @Column(length = 500)
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public EquipmentMaintenance() {}

    @PreUpdate
    public void onPreUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

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

    public LocalDate getCompletedDate() {
        return completedDate;
    }

    public void setCompletedDate(LocalDate completedDate) {
        this.completedDate = completedDate;
    }

    public MaintenanceStatus getStatus() {
        return status;
    }

    public void setStatus(MaintenanceStatus status) {
        this.status = status;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
