package com.lunar.habitat.dto.request;

import com.lunar.habitat.enums.AlertSeverity;
import com.lunar.habitat.enums.ThresholdParameter;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class ThresholdRequest {

    @NotNull(message = "Parameter is required")
    private ThresholdParameter parameter;

    private BigDecimal minimumValue;
    private BigDecimal maximumValue;

    @NotBlank(message = "Unit is required")
    private String unit;

    @NotNull(message = "Severity is required")
    private AlertSeverity severity;

    private boolean enabled = true;
    private String actionDescription;

    public ThresholdRequest() {}

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
}
