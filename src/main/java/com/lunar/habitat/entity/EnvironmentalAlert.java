package com.lunar.habitat.entity;

import com.lunar.habitat.enums.AlertSeverity;
import com.lunar.habitat.enums.AlertStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "environmental_alerts")
public class EnvironmentalAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "habitat_zone_id", nullable = false)
    private HabitatZone habitatZone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "telemetry_id")
    private Telemetry telemetry;

    @Column(name = "alert_type", nullable = false, length = 100)
    private String alertType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AlertSeverity severity;

    @Column(nullable = false, length = 500)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AlertStatus status = AlertStatus.OPEN;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;

    @Column(name = "acknowledged_by", length = 100)
    private String acknowledgedBy;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "resolved_by", length = 100)
    private String resolvedBy;

    public EnvironmentalAlert() {}

    public EnvironmentalAlert(HabitatZone habitatZone, Telemetry telemetry, String alertType, AlertSeverity severity, String message) {
        this.habitatZone = habitatZone;
        this.telemetry = telemetry;
        this.alertType = alertType;
        this.severity = severity;
        this.message = message;
        this.status = AlertStatus.OPEN;
        this.createdAt = LocalDateTime.now();
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

    public Telemetry getTelemetry() {
        return telemetry;
    }

    public void setTelemetry(Telemetry telemetry) {
        this.telemetry = telemetry;
    }

    public String getAlertType() {
        return alertType;
    }

    public void setAlertType(String alertType) {
        this.alertType = alertType;
    }

    public AlertSeverity getSeverity() {
        return severity;
    }

    public void setSeverity(AlertSeverity severity) {
        this.severity = severity;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public AlertStatus getStatus() {
        return status;
    }

    public void setStatus(AlertStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getAcknowledgedAt() {
        return acknowledgedAt;
    }

    public void setAcknowledgedAt(LocalDateTime acknowledgedAt) {
        this.acknowledgedAt = acknowledgedAt;
    }

    public String getAcknowledgedBy() {
        return acknowledgedBy;
    }

    public void setAcknowledgedBy(String acknowledgedBy) {
        this.acknowledgedBy = acknowledgedBy;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public String getResolvedBy() {
        return resolvedBy;
    }

    public void setResolvedBy(String resolvedBy) {
        this.resolvedBy = resolvedBy;
    }
}
