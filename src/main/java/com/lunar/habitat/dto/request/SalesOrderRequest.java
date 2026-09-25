package com.lunar.habitat.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public class SalesOrderRequest {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    private Long habitatZoneId;
    private LocalDate servicePeriodStart;
    private LocalDate servicePeriodEnd;
    private String notes;

    @NotEmpty(message = "Sales order must contain at least one line item")
    @Valid
    private List<LineItemRequest> lines;

    public SalesOrderRequest() {}

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public Long getHabitatZoneId() {
        return habitatZoneId;
    }

    public void setHabitatZoneId(Long habitatZoneId) {
        this.habitatZoneId = habitatZoneId;
    }

    public LocalDate getServicePeriodStart() {
        return servicePeriodStart;
    }

    public void setServicePeriodStart(LocalDate servicePeriodStart) {
        this.servicePeriodStart = servicePeriodStart;
    }

    public LocalDate getServicePeriodEnd() {
        return servicePeriodEnd;
    }

    public void setServicePeriodEnd(LocalDate servicePeriodEnd) {
        this.servicePeriodEnd = servicePeriodEnd;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<LineItemRequest> getLines() {
        return lines;
    }

    public void setLines(List<LineItemRequest> lines) {
        this.lines = lines;
    }
}
