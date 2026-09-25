package com.lunar.habitat.dto.request;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class ConsumptionBillingRequest {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "Habitat zone ID is required")
    private Long habitatZoneId;

    @NotNull(message = "Billing period start date is required")
    private LocalDate billingPeriodStart;

    @NotNull(message = "Billing period end date is required")
    private LocalDate billingPeriodEnd;

    private boolean includeScrubberService = true;
    private String notes;

    public ConsumptionBillingRequest() {}

    public ConsumptionBillingRequest(Long customerId, Long habitatZoneId, LocalDate billingPeriodStart, LocalDate billingPeriodEnd) {
        this.customerId = customerId;
        this.habitatZoneId = habitatZoneId;
        this.billingPeriodStart = billingPeriodStart;
        this.billingPeriodEnd = billingPeriodEnd;
        this.includeScrubberService = true;
    }

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

    public LocalDate getBillingPeriodStart() {
        return billingPeriodStart;
    }

    public void setBillingPeriodStart(LocalDate billingPeriodStart) {
        this.billingPeriodStart = billingPeriodStart;
    }

    public LocalDate getBillingPeriodEnd() {
        return billingPeriodEnd;
    }

    public void setBillingPeriodEnd(LocalDate billingPeriodEnd) {
        this.billingPeriodEnd = billingPeriodEnd;
    }

    public boolean isIncludeScrubberService() {
        return includeScrubberService;
    }

    public void setIncludeScrubberService(boolean includeScrubberService) {
        this.includeScrubberService = includeScrubberService;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
