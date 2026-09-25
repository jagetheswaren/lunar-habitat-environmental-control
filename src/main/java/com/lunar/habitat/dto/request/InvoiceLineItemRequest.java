package com.lunar.habitat.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

public class InvoiceLineItemRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    private String description;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be greater than zero")
    private BigDecimal quantity;

    @PositiveOrZero(message = "Unit price must be zero or positive")
    private BigDecimal unitPrice;

    @PositiveOrZero(message = "Tax rate must be zero or positive")
    private BigDecimal taxRate;

    public InvoiceLineItemRequest() {}

    public InvoiceLineItemRequest(Long productId, String description, BigDecimal quantity, BigDecimal unitPrice, BigDecimal taxRate) {
        this.productId = productId;
        this.description = description;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.taxRate = taxRate;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public BigDecimal getTaxRate() {
        return taxRate;
    }

    public void setTaxRate(BigDecimal taxRate) {
        this.taxRate = taxRate;
    }
}
