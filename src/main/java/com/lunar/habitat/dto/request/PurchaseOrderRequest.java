package com.lunar.habitat.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public class PurchaseOrderRequest {

    @NotNull(message = "Vendor ID is required")
    private Long vendorId;

    private LocalDate expectedDate;
    private String notes;

    @NotEmpty(message = "Purchase order must contain at least one line item")
    @Valid
    private List<LineItemRequest> lines;

    public PurchaseOrderRequest() {}

    public Long getVendorId() {
        return vendorId;
    }

    public void setVendorId(Long vendorId) {
        this.vendorId = vendorId;
    }

    public LocalDate getExpectedDate() {
        return expectedDate;
    }

    public void setExpectedDate(LocalDate expectedDate) {
        this.expectedDate = expectedDate;
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
