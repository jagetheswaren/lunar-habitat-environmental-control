package com.lunar.habitat.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public class VendorBillRequest {

    @NotNull(message = "Vendor ID is required")
    private Long vendorId;

    private Long purchaseOrderId;

    @NotNull(message = "Bill date is required")
    private LocalDate billDate = LocalDate.now();

    @NotNull(message = "Due date is required")
    private LocalDate dueDate = LocalDate.now().plusDays(30);

    private String notes;

    @NotEmpty(message = "Vendor bill must contain at least one line item")
    @Valid
    private List<LineItemRequest> lines;

    public VendorBillRequest() {}

    public Long getVendorId() {
        return vendorId;
    }

    public void setVendorId(Long vendorId) {
        this.vendorId = vendorId;
    }

    public Long getPurchaseOrderId() {
        return purchaseOrderId;
    }

    public void setPurchaseOrderId(Long purchaseOrderId) {
        this.purchaseOrderId = purchaseOrderId;
    }

    public LocalDate getBillDate() {
        return billDate;
    }

    public void setBillDate(LocalDate billDate) {
        this.billDate = billDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
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
