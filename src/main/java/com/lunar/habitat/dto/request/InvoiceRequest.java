package com.lunar.habitat.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public class InvoiceRequest {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    private Long salesOrderId;
    private Long habitatZoneId;

    @NotNull(message = "Invoice date is required")
    private LocalDate invoiceDate = LocalDate.now();

    @NotNull(message = "Due date is required")
    private LocalDate dueDate = LocalDate.now().plusDays(30);

    private LocalDate billingPeriodStart;
    private LocalDate billingPeriodEnd;
    private String notes;

    @NotEmpty(message = "Invoice must contain at least one line item")
    @Valid
    private List<InvoiceLineItemRequest> lines;

    public InvoiceRequest() {}

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public Long getSalesOrderId() {
        return salesOrderId;
    }

    public void setSalesOrderId(Long salesOrderId) {
        this.salesOrderId = salesOrderId;
    }

    public Long getHabitatZoneId() {
        return habitatZoneId;
    }

    public void setHabitatZoneId(Long habitatZoneId) {
        this.habitatZoneId = habitatZoneId;
    }

    public LocalDate getInvoiceDate() {
        return invoiceDate;
    }

    public void setInvoiceDate(LocalDate invoiceDate) {
        this.invoiceDate = invoiceDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<InvoiceLineItemRequest> getLines() {
        return lines;
    }

    public void setLines(List<InvoiceLineItemRequest> lines) {
        this.lines = lines;
    }
}
