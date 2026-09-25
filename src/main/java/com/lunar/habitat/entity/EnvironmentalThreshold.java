package com.lunar.habitat.entity;

import com.lunar.habitat.enums.AlertSeverity;
import com.lunar.habitat.enums.ThresholdParameter;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "environmental_thresholds")
public class EnvironmentalThreshold {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true, length = 50)
    private ThresholdParameter parameter;

    @Column(name = "minimum_value", precision = 19, scale = 4)
    private BigDecimal minimumValue;

    @Column(name = "maximum_value", precision = 19, scale = 4)
    private BigDecimal maximumValue;

    @Column(nullable = false, length = 30)
    private String unit;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AlertSeverity severity = AlertSeverity.WARNING;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(name = "action_description", length = 255)
    private String actionDescription;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public EnvironmentalThreshold() {}

    public EnvironmentalThreshold(ThresholdParameter parameter, BigDecimal minimumValue, BigDecimal maximumValue, String unit, AlertSeverity severity, String actionDescription) {
        this.parameter = parameter;
        this.minimumValue = minimumValue;
        this.maximumValue = maximumValue;
        this.unit = unit;
        this.severity = severity;
        this.actionDescription = actionDescription;
        this.enabled = true;
    }

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

    public ThresholdParameter getParameter() {
        return parameter;
    }

    public void setParameter(ThresholdParameter parameter) {
        this.parameter = parameter;
    }

    public BigDecimal getMinimumValue() {
        return minimumValue;
    }

    public void setMinimumValue(BigDecimal minimumValue) {
        this.minimumValue = minimumValue;
    }

    public BigDecimal getMaximumValue() {
        return maximumValue;
    }

    public void setMaximumValue(BigDecimal maximumValue) {
        this.maximumValue = maximumValue;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public AlertSeverity getSeverity() {
        return severity;
    }

    public void setSeverity(AlertSeverity severity) {
        this.severity = severity;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getActionDescription() {
        return actionDescription;
    }

    public void setActionDescription(String actionDescription) {
        this.actionDescription = actionDescription;
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
