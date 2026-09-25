package com.lunar.habitat.dto.request;

import com.lunar.habitat.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

public class PaymentRequest {

    private Long invoiceId;
    private Long vendorBillId;

    @NotNull(message = "Contact ID is required")
    private Long contactId;

    @NotNull(message = "Payment amount is required")
    @Positive(message = "Payment amount must be greater than zero")
    private BigDecimal amount;

    @NotNull(message = "Payment date is required")
    private LocalDate paymentDate = LocalDate.now();

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod = PaymentMethod.BANK_TRANSFER;

    private String notes;

    public PaymentRequest() {}

    public Long getInvoiceId() {
        return invoiceId;
    }

    public void setInvoiceId(Long invoiceId) {
        this.invoiceId = invoiceId;
    }

    public Long getVendorBillId() {
        return vendorBillId;
    }

    public void setVendorBillId(Long vendorBillId) {
        this.vendorBillId = vendorBillId;
    }

    public Long getContactId() {
        return contactId;
    }

    public void setContactId(Long contactId) {
        this.contactId = contactId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
